
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { ClimateRiskData, InsurancePolicy, UserProfile } from "../types";
import { safeJSONParse } from "../utils/sharedUtils";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Mock Data Generators for Quota Exceeded Scenarios
const getMockClimateData = (location: string): ClimateRiskData => ({
    score: 35,
    level: 'LOW',
    trend: 'stable',
    factors: {
        drought: { score: 20, rainfallDeficit: 10, daysSinceRain: 3, label: 'Normal' },
        vegetation: { score: 15, ndviDrop: 5, stressLevel: 'Healthy', label: 'Good Vigor' },
        soil: { score: 30, moisture: 60, wiltingDays: 10, label: 'Adequate' }
    },
    forecast: Array(7).fill(0).map((_, i) => ({
        day: new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', {weekday: 'short'}),
        temp: 24 + Math.round(Math.random() * 5),
        rainProb: Math.round(Math.random() * 30),
        condition: 'Partly Cloudy'
    })),
    recommendations: [{ id: 'mock1', priority: 'LOW', action: 'Monitor normally', reason: 'System in offline/cached mode.', impact: 'Maintenance' }]
});

const getMockInsuranceData = (profile: UserProfile): InsurancePolicy => ({
    id: 'POL-OFFLINE-MODE',
    status: 'ACTIVE',
    coverageAmount: 50000,
    premium: 5000,
    daysRemaining: 120,
    crop: profile.crops[0] || 'Maize',
    provider: 'LIMA Shelter',
    triggers: [
        { type: 'Rainfall', currentValue: '80mm', threshold: '50mm', status: 'SAFE', progress: 20, trend: 'stable' },
        { type: 'Vegetation Health', currentValue: '0.6', threshold: '0.3', status: 'SAFE', progress: 10, trend: 'stable' }
    ],
    payoutEstimation: 0,
    claimsHistory: []
});

const getCachedData = <T>(key: string): T | null => {
    // Simple key-based retrieval. The key itself should contain the date for validity.
    return safeJSONParse<T | null>(key, null);
};

const setCachedData = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Cache write error", e);
    }
};

export const getClimateRiskData = async (location: string): Promise<ClimateRiskData> => {
    // CACHE STRATEGY: Key includes Date. This enforces 24-hour caching per location.
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `lima_climate_v2_${location}_${today}`;
    
    const cached = getCachedData<ClimateRiskData>(cacheKey);
    if (cached) return cached;

    const model = "gemini-2.5-flash";
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER, description: "Composite risk score 0-100" },
            level: { type: Type.STRING, enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE'] },
            trend: { type: Type.STRING, enum: ['increasing', 'decreasing', 'stable'] },
            factors: {
                type: Type.OBJECT,
                properties: {
                    drought: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, rainfallDeficit: {type: Type.NUMBER}, daysSinceRain: {type: Type.NUMBER}, label: {type: Type.STRING} }, required: ["score", "rainfallDeficit", "daysSinceRain", "label"] },
                    vegetation: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, ndviDrop: {type: Type.NUMBER}, stressLevel: {type: Type.STRING}, label: {type: Type.STRING} }, required: ["score", "ndviDrop", "stressLevel", "label"] },
                    soil: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, moisture: {type: Type.NUMBER}, wiltingDays: {type: Type.NUMBER}, label: {type: Type.STRING} }, required: ["score", "moisture", "wiltingDays", "label"] }
                },
                required: ["drought", "vegetation", "soil"]
            },
            forecast: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { day: {type: Type.STRING}, temp: {type: Type.NUMBER}, rainProb: {type: Type.NUMBER}, condition: {type: Type.STRING} }, required: ["day", "temp", "rainProb", "condition"] }
            },
            recommendations: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { id: {type: Type.STRING}, priority: {type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']}, action: {type: Type.STRING}, reason: {type: Type.STRING}, impact: {type: Type.STRING} }, required: ["id", "priority", "action", "reason", "impact"] }
            }
        },
        required: ["score", "level", "trend", "factors", "forecast", "recommendations"]
    };

    const prompt = `
        Act as an expert climatologist using satellite data.
        Generate a REALISTIC Climate Risk Assessment for a farm in ${location}, Kenya.
        
        Consider:
        1. Current season and typical weather patterns for ${location}.
        2. Realistic NDVI (Vegetation Health) and Soil Moisture values for this region right now.
        3. If it's currently dry season, show higher drought risk. If rainy season, show flood/disease risk.
        4. Generate a 7-day forecast consistent with the season.
        5. Provide specific agronomic recommendations based on these risks.
        
        Return STRICT JSON matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are a backend service calculating climate risks. Be realistic and scientifically accurate."
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text) as ClimateRiskData;
            setCachedData(cacheKey, data);
            return data;
        }
        throw new Error("No data returned");
    } catch (error: any) {
        console.warn("Climate Service API Limit/Error - Returning Mock Data", error);
        // If Quota exceeded (429) or other error, return consistent mock data to keep app usable
        const mock = getMockClimateData(location);
        // We do NOT cache the mock for 24h, so retry is possible on reload if quota resets
        return mock;
    }
};

export const getInsurancePolicy = async (profile: UserProfile): Promise<InsurancePolicy> => {
    // CACHE STRATEGY: Key includes Date. Enforces 24-hour caching.
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `lima_insurance_v2_${profile.name}_${today}`;

    const cached = getCachedData<InsurancePolicy>(cacheKey);
    if (cached) return cached;

    const model = "gemini-2.5-flash";

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['ACTIVE', 'WARNING', 'EXPIRED'] },
            coverageAmount: { type: Type.NUMBER },
            premium: { type: Type.NUMBER },
            daysRemaining: { type: Type.NUMBER },
            crop: { type: Type.STRING },
            provider: { type: Type.STRING },
            triggers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['Rainfall', 'Vegetation Health'] },
                        currentValue: { type: Type.STRING },
                        threshold: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['SAFE', 'WARNING', 'CRITICAL'] },
                        progress: { type: Type.NUMBER },
                        trend: { type: Type.STRING, enum: ['improving', 'worsening', 'stable'] }
                    },
                    required: ["type", "currentValue", "threshold", "status", "progress", "trend"]
                }
            },
            payoutEstimation: { type: Type.NUMBER },
            claimsHistory: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        trigger: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        status: { type: Type.STRING, enum: ['Paid', 'Processing'] }
                    },
                    required: ["date", "trigger", "amount", "status"]
                }
            }
        },
        required: ["id", "status", "coverageAmount", "premium", "daysRemaining", "crop", "provider", "triggers", "payoutEstimation", "claimsHistory"]
    };

    const prompt = `
        Generate a realistic Parametric Insurance Policy status for a smallholder farmer.
        Farmer: ${profile.name}, Location: ${profile.location}, Crop: ${profile.crops[0] || 'Maize'}.
        
        Scenario:
        1. Assume a standard parametric drought policy (covers rainfall deficit or vegetation health drop).
        2. Simulate realistic trigger values based on the likely weather in ${profile.location}.
        3. If the weather is typically dry now, show 'WARNING' status and high progress towards trigger.
        4. Calculate a payout estimation if triggers are close.
        
        Return STRICT JSON matching schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are an insurance actuary system. Generate precise policy data."
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text) as InsurancePolicy;
            setCachedData(cacheKey, data);
            return data;
        }
        throw new Error("No insurance data");
    } catch (error) {
        console.warn("Insurance Service API Limit/Error - Returning Mock Data", error);
        return getMockInsuranceData(profile);
    }
};
