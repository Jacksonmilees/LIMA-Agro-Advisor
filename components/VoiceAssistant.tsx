
import React, { useState, useRef } from 'react';
import { Mic, MicOff, BarChart3, Activity, DollarSign, TrendingUp, TrendingDown, Check, ScanLine, Loader2, Handshake, Ear, Radio, X, Phone, Globe, CloudRain, ShieldCheck } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';
import { FarmRecord, ExpenseRecord, UserProfile, Reminder, Language } from '../types';
import { analyzeReceipt } from '../services/geminiService';
import { getClimateRiskData, getInsurancePolicy } from '../services/climateService';

interface VoiceAssistantProps {
    totalRevenue: number;
    totalExpenses: number;
    harvests: FarmRecord[];
    expenses: ExpenseRecord[];
    userProfile: UserProfile;
    language: Language;
    onLogHarvest: (record: FarmRecord) => void;
    onLogExpense: (record: ExpenseRecord) => void;
    onAddReminder: (reminder: Reminder) => void;
}

type VoiceMode = 'ADVISOR' | 'NEGOTIATOR' | 'CALL_SIMULATION';

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ totalRevenue, totalExpenses, harvests, expenses, userProfile, language, onLogHarvest, onLogExpense, onAddReminder }) => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [mode, setMode] = useState<VoiceMode>('ADVISOR');
  const [isAmbient, setIsAmbient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [processingReceipt, setProcessingReceipt] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const getSystemInstruction = (lang: Language, currentMode: VoiceMode, ambient: boolean) => {
    const langInstructions = {
        en: "Speak in English with a distinct Kenyan accent.",
        sw: "Ongea Kiswahili sanifu chenye lahaja ya Kenya.",
        ki: "Aria Gikuyu kiega. Tumira ciugo cia urimi cia Gikuyu. (Speak in Kikuyu, use farming terms)",
        luo: "Wuo Dholuo. Ti gi weche mag pur ma jaluo tiyo godo. (Speak in Dholuo)",
        luy: "Lomoba Luluhya. Koosesya amang'ana ke burimi. (Speak in Luhya)",
        kal: "Speak in Kalenjin. Use agricultural terms relevant to Rift Valley farming.",
        maa: "Speak in Maasai (Maa). Focus on pastoral and farming terms."
    };

    const creatorInfo = `
    CREATOR INFO:
    You were created by Jackson Alex, Founder & CEO of LIMA.
    Jackson is a JKUAT CS graduate and creator of KAVI.
    If asked about who made you, tell them about Jackson Alex.
    `;

    let personaInstruction = "";
    
    if (ambient) {
        personaInstruction = `
            MODE: AMBIENT LISTENING.
            Goal: Listen silently. Only speak if addressed as "LIMA".
            Context: The farmer might be discussing climate risks or insurance. Listen for keywords like "drought", "rain", "insurance", "payout".
        `;
    } else if (currentMode === 'ADVISOR' || currentMode === 'CALL_SIMULATION') {
        personaInstruction = `
            You are 'LIMA Siri', a helpful agricultural assistant for ${userProfile.name}.
            Tone: Encouraging, educational, expert.
            
            FARM DATA:
            - Location: ${userProfile.location}
            - Crops: ${userProfile.crops.join(', ')}
            - Revenue: KES ${totalRevenue}
            - Expenses: KES ${totalExpenses}
            
            CAPABILITIES:
            1. CLIMATE INTELLIGENCE: You can fetch real-time climate risk scores (Drought, NDVI).
            2. INSURANCE: You can check insurance policy status and estimated payouts.
            3. MARKETS: You know market prices.
            
            INTERACTION STYLE:
            - If asked "Should I plant?", check the climate risk first.
            - If asked about insurance, explain triggers simply.
            - Use the 'get_climate_risk' and 'get_insurance_status' tools to answer specific questions accurately.
        `;
    } else {
        personaInstruction = `
            ROLEPLAY MODE: TOUGH MARKET BROKER.
            Goal: Negotiate hard. Claim prices are low due to "bad weather" or "oversupply".
        `;
    }

    return `
        ${personaInstruction}
        ${creatorInfo}
        LANGUAGE INSTRUCTION: ${langInstructions[lang]}
        IMPORTANT: Maintain this language and persona throughout the session.
    `;
  };

  const startSession = async () => {
    setError(null);
    setTranscript('');
    setStatus('connecting');

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true } 
      });

      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputContext.createMediaStreamSource(streamRef.current);
      const processor = inputContext.createScriptProcessor(4096, 1, 1);
      
      inputSourceRef.current = source;
      processorRef.current = processor;

      const activeTools = (mode === 'ADVISOR' && !isAmbient) ? [{
          functionDeclarations: [
            {
              name: "log_harvest",
              description: "Log harvest.",
              parameters: { type: Type.OBJECT, properties: { crop: { type: Type.STRING }, amount: { type: Type.NUMBER }, unit: { type: Type.STRING } }, required: ["crop", "amount", "unit"] }
            },
            {
                name: "get_climate_risk",
                description: "Get current climate risk data (drought, ndvi) for the farm.",
                parameters: { type: Type.OBJECT, properties: {} }
            },
            {
                name: "get_insurance_status",
                description: "Check insurance policy status, triggers, and payout estimation.",
                parameters: { type: Type.OBJECT, properties: {} }
            }
          ]
      }] : undefined;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {}, 
            tools: activeTools,
            systemInstruction: getSystemInstruction(selectedLang, mode, isAmbient),
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } }
        },
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            setStatus('listening');
            source.connect(processor);
            processor.connect(inputContext.destination);
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                sessionPromise.then(session => session.sendRealtimeInput({ media: createPcmBlob(inputData) }));
            };
          },
          onmessage: async (msg: LiveServerMessage) => {
             if (msg.serverContent?.inputTranscription) {
                 setTranscript(isAmbient ? "Listening..." : "You: " + msg.serverContent?.inputTranscription?.text);
             }

             const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && audioContextRef.current) {
                 setStatus('speaking');
                 const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), audioContextRef.current);
                 const sourceNode = audioContextRef.current.createBufferSource();
                 sourceNode.buffer = audioBuffer;
                 sourceNode.connect(audioContextRef.current.destination);
                 const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
                 sourceNode.start(startTime);
                 nextStartTimeRef.current = startTime + audioBuffer.duration;
                 sourceNodesRef.current.push(sourceNode);
                 sourceNode.onended = () => {
                     sourceNodesRef.current = sourceNodesRef.current.filter(s => s !== sourceNode);
                     if (sourceNodesRef.current.length === 0) setStatus('listening');
                 };
             }

             if (msg.toolCall) {
                for (const fc of msg.toolCall.functionCalls) {
                    if (fc.name === 'log_harvest') {
                        sessionPromise.then(session => session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: { status: "success" } } } }));
                    } else if (fc.name === 'get_climate_risk') {
                        setTranscript("Checking climate satellites...");
                        // Call the real service
                        const data = await getClimateRiskData(userProfile.location);
                        sessionPromise.then(session => session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: data } } }));
                    } else if (fc.name === 'get_insurance_status') {
                        setTranscript("Checking insurance policy...");
                        const data = await getInsurancePolicy(userProfile);
                        sessionPromise.then(session => session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: data } } }));
                    }
                }
             }
          },
          onclose: () => stopSession(),
          onerror: (err) => { console.error(err); stopSession(); setError("Connection error"); }
        }
      });
      sessionPromiseRef.current = sessionPromise;
      setActive(true);
    } catch (err) {
      console.error(err);
      setError("Microphone access failed.");
      setStatus('idle');
    }
  };

  const stopSession = () => {
    setActive(false);
    setStatus('idle');
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (processorRef.current) processorRef.current.disconnect();
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
  };

  const startCallSimulation = () => {
      if (active) stopSession();
      setMode('CALL_SIMULATION');
      setTimeout(() => startSession(), 500);
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setProcessingReceipt(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              try {
                  const base64 = (reader.result as string).split(',')[1];
                  const result = await analyzeReceipt(base64);
                  if (result && result.amount) {
                      onLogExpense({ id: Date.now().toString(), category: result.category as any || 'Other', amount: result.amount, date: result.date || new Date().toISOString().split('T')[0], note: result.note || 'Receipt Scan' });
                      setTranscript(`✓ Receipt Processed`);
                  }
              } finally { setProcessingReceipt(false); }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  return (
    <div className={`flex flex-col h-full text-white relative transition-colors duration-500 overflow-y-auto custom-scrollbar overscroll-contain ${isAmbient ? 'bg-stone-900' : mode === 'NEGOTIATOR' ? 'bg-indigo-950' : 'bg-slate-900'}`}>
      
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className={`absolute top-0 right-0 w-1/2 h-1/2 rounded-full blur-[100px] transition-colors duration-500 ${isAmbient ? 'bg-orange-900/20' : mode === 'NEGOTIATOR' ? 'bg-purple-900/30' : 'bg-emerald-900/20'}`}></div>
      </div>

      <div className="z-10 flex flex-col h-full p-6 md:p-12 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
                {mode === 'CALL_SIMULATION' ? <Phone className="text-blue-400 w-6 h-6" /> : <Activity className="text-emerald-400 w-6 h-6" />}
                {mode === 'CALL_SIMULATION' ? 'LIMA Hotline' : 'Voice Assistant'}
            </h2>
            <div className="flex flex-wrap gap-2">
                 <select 
                    value={selectedLang} 
                    onChange={(e) => setSelectedLang(e.target.value as Language)}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-xs font-bold uppercase"
                 >
                     <option value="en">English</option>
                     <option value="sw">Kiswahili</option>
                     <option value="ki">Kikuyu</option>
                     <option value="luo">Dholuo</option>
                     <option value="luy">Luhya</option>
                     <option value="kal">Kalenjin (Beta)</option>
                     <option value="maa">Maasai (Beta)</option>
                 </select>
                 
                 <button 
                    onClick={() => { setIsAmbient(!isAmbient); if(active) stopSession(); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all flex items-center ${isAmbient ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-stone-600 text-stone-400'}`}
                 >
                     <Ear className="w-4 h-4 mr-2" /> Ambient
                 </button>
            </div>
        </div>

        {/* Visualizer Area */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 mb-12">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                 {/* Visualizer Circles/Animations */}
                 {!active && (
                     <div className="w-32 h-32 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center shadow-inner">
                         {mode === 'CALL_SIMULATION' ? <Phone className="w-10 h-10 text-slate-500" /> : <Mic className="w-10 h-10 text-slate-500" />}
                     </div>
                 )}
                 {active && (
                     <div className={`relative w-28 h-28 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse ${isAmbient ? 'bg-amber-900/50' : 'bg-emerald-900/50'}`}>
                         <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
                             {status === 'speaking' ? <div className="animate-pulse font-bold text-xs tracking-widest uppercase">Speaking</div> : <Mic className="w-10 h-10 text-white" />}
                         </div>
                     </div>
                 )}
            </div>
            
            <div className="w-full max-w-lg min-h-[80px] flex flex-col items-center justify-start text-center">
                 {transcript && (
                     <div className="bg-slate-800/80 p-6 rounded-2xl w-full border border-white/10">
                         <p className="text-lg text-white font-medium">{transcript}</p>
                     </div>
                 )}
                 {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
                 
                 {mode === 'ADVISOR' && !isAmbient && (
                     <div className="mt-6 flex gap-3 opacity-50 text-xs text-slate-400">
                         <span className="flex items-center"><CloudRain className="w-3 h-3 mr-1" /> Climate Ready</span>
                         <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Insurance Connected</span>
                     </div>
                 )}
            </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center pb-24 md:pb-0 gap-6 items-center">
            {mode === 'ADVISOR' && !isAmbient && (
                <button onClick={() => receiptInputRef.current?.click()} className="p-4 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700">
                    <ScanLine className="w-6 h-6" />
                    <input type="file" ref={receiptInputRef} className="hidden" accept="image/*" onChange={handleReceiptUpload}/>
                </button>
            )}

            {!active ? (
                <button onClick={startSession} className={`group relative flex items-center justify-center ${processingReceipt ? 'opacity-50' : ''}`}>
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl bg-emerald-600 hover:bg-emerald-500">
                        <Mic className="w-8 h-8 text-white" />
                    </div>
                </button>
            ) : (
                <button onClick={stopSession} className="group relative flex items-center justify-center">
                     <div className="relative w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-2xl">
                        <MicOff className="w-8 h-8 text-white" />
                    </div>
                </button>
            )}

            {!active && !isAmbient && (
                <button onClick={startCallSimulation} className="p-4 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:bg-blue-900/50 hover:text-blue-400 hover:border-blue-500" title="Simulate Phone Call">
                    <Phone className="w-6 h-6" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
