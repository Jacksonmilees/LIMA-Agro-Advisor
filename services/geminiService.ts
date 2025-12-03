
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MarketAnalysis, CropType, WeatherInsight, MarketComparisonItem, Language, FarmActivity, UserProfile, Reminder } from "../types";
import { safeJSONParse } from "../utils/sharedUtils";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const JACKSON_ALEX_BIO = `
About the Creator: Jackson Alex - Founder & CEO.
Background: Computer Science graduate from Jomo Kenyatta University of Agriculture and Technology (JKUAT), specializing in software development and AI.
Previous Work: Created KAVI (Kenya AI Voice Interface), an award-winning financial AI agent that won Best AI Agent 2025.
Motivation: Jackson recognized that Kenya's smallholder farmers face challenges in accessing expert guidance. He aims to empower farmers to make data-driven decisions that increase incomes by 20-40%.
Vision: A future where every smallholder farmer in Kenya has a personal AI farming assistant in their pocket that speaks their language and works offline.
Role: Leads vision, AI architecture, and product development.
Philosophy: "Technology should speak the people's language... every farmer deserves access to the same quality of advice that large commercial farms get."
`;

// Helper: Exponential Backoff Retry
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    
    // Retry on 503 (Service Unavailable) or 429 (Too Many Requests) or Network Error
    const shouldRetry = error.message?.includes('503') || error.message?.includes('429') || error.message?.includes('fetch failed');
    
    if (shouldRetry) {
      console.warn(`Retrying operation... attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Helper: Clean JSON string from Markdown code blocks
const cleanJSON = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Robust cache helper using safeJSONParse
const getCachedData = <T>(key: string): T | null => {
    const cachedWrapper = safeJSONParse<{timestamp: number, data: T} | null>(key, null);
    if (cachedWrapper && cachedWrapper.data) {
        return cachedWrapper.data;
    }
    return null;
};

const setCachedData = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (e) {
        console.error("Cache write error - likely quota exceeded", e);
    }
};

export const generateJournalInsights = async (activities: FarmActivity[], profile: UserProfile, language: Language = 'en'): Promise<string> => {
    // CACHE STRATEGY: Cache based on date AND number/ID of activities to prevent excessive calls on dashboard load
    const today = new Date().toISOString().split('T')[0];
    const activityHash = activities.length + (activities[0]?.id || '0'); 
    const cacheKey = `lima_journal_insight_${activityHash}_${language}_${today}`;
    
    const cached = getCachedData<string>(cacheKey);
    if (cached) return cached;

    const model = "gemini-2.5-flash";
    const recentActivities = activities.slice(0, 5).map(a => `${a.date}: ${a.type} - ${a.details} (${a.quantity || ''})`).join('\n');
    
    const prompt = `
        Analyze these recent farm activities for a farmer in ${profile.location} growing ${profile.crops.join(', ')}.
        Soil: ${profile.soilType}.
        Recent Activities:
        ${recentActivities}
        
        Language: ${language === 'sw' ? 'Kiswahili' : 'English'}.
        Provide 1 crucial, short insight or advice based on this data. 
        Example: "Since you sprayed [Pesticide] 2 weeks ago, scout for resistance now."
        Keep it under 30 words.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        const text = response.text || "Keep logging activities for better insights.";
        setCachedData(cacheKey, text);
        return text;
    } catch (error) {
        return "Insight unavailable offline.";
    }
};

export const generateCropCalendar = async (crop: string, startDate: string, location: string, language: Language = 'en'): Promise<Partial<Reminder>[]> => {
    const model = "gemini-2.5-flash";
    
    const prompt = `
        Create a farming schedule for ${crop} planted on ${startDate} in ${location}, Kenya.
        Language: ${language === 'sw' ? 'Kiswahili' : 'English'}.
        Generate 4-6 key tasks (Weeding, Fertilizer, Pest Control, Harvest).
        
        IMPORTANT: Output valid JSON Array only.
        Format:
        [
            {
                "text": "Task description",
                "date": "YYYY-MM-DD",
                "type": "Task"
            }
        ]
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert agronomist. Output JSON only."
            }
        });
        
        const jsonString = cleanJSON(response.text || "[]");
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Calendar generation error", error);
        return [];
    }
};

export const generateMarketOverview = async (crops: string[], location: string, language: Language = 'en'): Promise<{crop: string, price: number, trend: 'up' | 'down' | 'stable'}[]> => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `lima_market_overview_${location}_${language}_${today}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  const model = "gemini-2.5-flash";
  const prompt = `
    Find current market prices in KES/kg for these crops in ${location}, Kenya: ${crops.join(', ')}.
    Language: ${language === 'sw' ? 'Kiswahili' : 'English'}.
    Return JSON Array: [{ "crop": "Name", "price": number, "trend": "up"|"down"|"stable" }].
    If exact price unknown for the location, estimate based on Kenya national averages.
    Ensure "price" is a number.
  `;

  try {
     return await retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "You are a market analyst. Output valid JSON only."
            }
        });
        const jsonString = cleanJSON(response.text || "[]");
        const data = JSON.parse(jsonString);
        setCachedData(cacheKey, data);
        return data;
     });
  } catch (e) {
      console.error("Market Overview Error", e);
      return crops.map(c => ({ crop: c, price: 0, trend: 'stable' }));
  }
};

export const generateMarketForecast = async (crop: CropType, location: string, language: Language = 'en', forceRefresh: boolean = false): Promise<MarketAnalysis> => {
  // DATE-BASED CACHING: Ensures stability. Data only refreshes if the date changes or forceRefresh is true.
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `lima_market_${crop}_${location}_${language}_${today}`;
  
  if (!forceRefresh) {
    const cached = getCachedData<MarketAnalysis>(cacheKey);
    if (cached) return cached;
  }

  const model = "gemini-2.5-flash"; 
  
  const prompt = `
    Act as an expert agricultural economist for the Kenyan market.
    Find current, ACCURATE market prices for ${crop} in ${location}, Kenya using Google Search.
    Language: ${language === 'sw' ? 'Kiswahili (Kenyan dialect)' : 'English'}.
    
    1. Search for today's market prices in Kenya (NAFIS, commodity prices).
    2. Provide 6 months of historical data (decreasing date).
    3. Provide 3 months of forecast.
    4. Prices must be real Market prices in KES.
    5. Provide a recommendation (SELL/HOLD/BUY) based on the search results.
    6. Reasoning should be specific to the data found.

    7. IMPORTANT: Output valid JSON ONLY. No markdown formatting.
    Structure:
    {
      "crop": "string",
      "location": "string",
      "currentPrice": number,
      "currency": "KES",
      "recommendation": "SELL" | "HOLD" | "BUY",
      "reasoning": "string",
      "data": [ 
         { 
           "month": "string", 
           "price": number, 
           "minPrice": number, 
           "maxPrice": number, 
           "type": "historical" | "forecast" 
         } 
      ]
    }
  `;

  try {
    return await retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // Enable Web Search for accuracy
                // NOTE: responseMimeType cannot be used with tools
                systemInstruction: "You are LIMA. Use real data from the web. Output strict JSON.",
            }
        });

        if (!response.text) throw new Error("No data returned");
        const jsonString = cleanJSON(response.text);
        const data = JSON.parse(jsonString) as MarketAnalysis;
        setCachedData(cacheKey, data);
        return data;
    });
  } catch (error) {
      console.error("Market API Error", error);
      throw error;
  }
};

export const generateMarketComparison = async (crop: CropType, baseLocation: string, language: Language = 'en', forceRefresh: boolean = false): Promise<MarketComparisonItem[]> => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `lima_comparison_${crop}_${baseLocation}_${language}_${today}`;
  
  if (!forceRefresh) {
    const cached = getCachedData<MarketComparisonItem[]>(cacheKey);
    if (cached) return cached;
  }

  const model = "gemini-2.5-flash";
  
  const prompt = `
      Find 3 real markets relevant to ${baseLocation}, Kenya for selling ${crop}.
      Use Google Search to find current prices in these markets.
      Language: ${language === 'sw' ? 'Kiswahili' : 'English'}.
      1. Local Farmgate.
      2. Nearest Town Market.
      3. Major City Market (Nairobi/Mombasa/Kisumu).
      Estimate transport costs realistically based on distance.
      Calculate net price (Price - Transport).
      Mark the best option as isBest: true.

      IMPORTANT: Output a valid JSON Array ONLY. No markdown.
      Example:
      [
          {
              "marketName": "string",
              "price": number,
              "distance": number,
              "transportCost": number,
              "netPrice": number,
              "isBest": boolean,
              "contactLead": "string"
          }
      ]
  `;

  try {
    return await retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // Web Search enabled
                // NOTE: responseMimeType cannot be used with tools
            }
        });
        const jsonString = cleanJSON(response.text || "[]");
        const data = JSON.parse(jsonString) as MarketComparisonItem[];
        setCachedData(cacheKey, data);
        return data;
    });
  } catch (error) {
      console.error("Comparison API Error", error);
      return [];
  }
};

export const generateWeatherInsight = async (location: string, language: Language = 'en', forceRefresh: boolean = false): Promise<WeatherInsight> => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `lima_weather_${location}_${language}_${today}`;
  
  if (!forceRefresh) {
      const cached = getCachedData<WeatherInsight>(cacheKey);
      if (cached) return cached;
  }

  const model = "gemini-2.5-flash";
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      temp: { type: Type.STRING },
      condition: { type: Type.STRING },
      humidity: { type: Type.STRING },
      tip: { type: Type.STRING }
    },
    required: ["temp", "condition", "humidity", "tip"]
  };

  const prompt = `
    Generate a current weather summary for ${location}, Kenya for today.
    Language: ${language === 'sw' ? 'Kiswahili' : 'English'}.
    Provide a very short, one-sentence actionable farming tip.
  `;

  try {
    return await retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            }
        });

        if (!response.text) throw new Error("No text");
        const data = JSON.parse(response.text) as WeatherInsight;
        setCachedData(cacheKey, data);
        return data;
    });
  } catch (error) {
    return {
        temp: "24°C", condition: "Cloudy", humidity: "60%", tip: "Check your crops for pests today."
    };
  }
}

export const generateChatResponse = async (
  message: string, 
  history: { role: string; text: string; image?: string }[],
  language: Language = 'en',
  imageBase64?: string
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const chat = ai.chats.create({
    model,
    history: chatHistory,
    config: {
        tools: [{googleSearch: {}}], // Chat also gets search for grounded answers
        systemInstruction: `
          You are 'LIMA' (Learning Intelligent Market Agro-advisor), a friendly agricultural assistant for Kenyan farmers. 
          Language: ${language === 'sw' ? 'Kiswahili (Sanifu + Sheng mixture)' : 'English (with some local Swahili terms)'}.
          Tone: Encouraging, practical, educational.
          Tasks:
          1. Pest Identification: If image provided, identify pest/disease. Suggest organic remedies first.
          2. Advice: Give advice on planting, fertilizer, weather.
          3. Keep answers concise (under 100 words).
          
          CREATOR INFO (Important):
          ${JACKSON_ALEX_BIO}
          If asked "Who created you?" or "Who made this app?", use the information above about Jackson Alex.
        `
    }
  });

  const currentParts: any[] = [{ text: message }];
  if (imageBase64) {
      currentParts.push({
          inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg' 
          }
      });
  }

  try {
    const response = await chat.sendMessage({ message: currentParts });
    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
      console.error("Chat error", error);
      throw error;
  }
};

export const analyzeReceipt = async (imageBase64: string): Promise<{ category: string; amount: number; date: string; note: string }> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Analyze this image of a farm receipt or invoice. 
    Extract: Category, Amount (number), Date (YYYY-MM-DD), Note.
  `;
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
        category: { type: Type.STRING, enum: ['Seeds', 'Fertilizer', 'Labor', 'Transport', 'Equipment', 'Other'] },
        amount: { type: Type.NUMBER },
        date: { type: Type.STRING },
        note: { type: Type.STRING }
    },
    required: ["category", "amount", "date", "note"]
  };

  try {
    const response = await ai.models.generateContent({
        model,
        contents: {
        parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
      console.error("Receipt Analysis Error", error);
      throw error;
  }
};
