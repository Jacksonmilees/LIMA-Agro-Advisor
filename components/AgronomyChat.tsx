
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, Bot, X, Zap, Stethoscope, Camera, Volume2, Bookmark, Globe, ChevronDown, Trash2, Share2 } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage, KnowledgeArticle, Language } from '../types';
import { resizeImage } from '../utils/sharedUtils';

interface AgronomyChatProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const AgronomyChat: React.FC<AgronomyChatProps> = ({ language, setLanguage, showToast }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'library' | 'doctor'>('chat');
  const [input, setInput] = useState('');
  
  // Initialize messages from local storage safely
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
      try {
        const saved = localStorage.getItem('lima_chat_history');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to load chat history", e);
        return [];
      }
  });

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
      try {
        const saved = localStorage.getItem('lima_bookmarks');
        return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const doctorInputRef = useRef<HTMLInputElement>(null);

  const languages: {code: Language, label: string}[] = [
      { code: 'en', label: 'English' },
      { code: 'sw', label: 'Kiswahili' },
      { code: 'ki', label: 'Gikuyu' },
      { code: 'luo', label: 'Dholuo' },
      { code: 'luy', label: 'Luluhya' }
  ];

  // Save messages to local storage
  useEffect(() => {
      try {
        localStorage.setItem('lima_chat_history', JSON.stringify(messages));
      } catch (e) {
          console.error("Storage limit exceeded for chat history", e);
          showToast("Storage full. Clear chat history to save more.", "error");
      }
  }, [messages, showToast]);

  useEffect(() => {
      localStorage.setItem('lima_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Initialize welcome message
  useEffect(() => {
      if (messages.length === 0) {
          let welcomeText = "Jambo! I am LIMA, your Intelligent Market Agro-advisor. Ask me anything about your farm or markets.";
          if (language === 'sw') welcomeText = "Jambo! Mimi ni LIMA, Mshauri wako wa Kilimo na Soko. Naweza kukusaidia.";
          if (language === 'ki') welcomeText = "Wimwega! Nnie LIMA, Mutaaramu waku wa mugunda. Nurio ki?";
          
          setMessages([{
              id: 'welcome',
              role: 'model',
              text: welcomeText,
              timestamp: Date.now()
          }]);
      }
  }, [language]); 

  // Hardcoded Knowledge Base for Demo
  const knowledgeArticles: KnowledgeArticle[] = [
      {
          id: '1', title: 'Fall Armyworm Control', category: 'Pests',
          summary: 'Identify and treat Fall Armyworm in maize.',
          content: 'Early detection is key. Check for window-pane damage on leaves. For organic control, use Neem oil or push-pull technology (Desmodium). For chemical, use Emamectin benzoate in early stages.'
      },
      {
          id: '2', title: 'Coffee Leaf Rust', category: 'Pests',
          summary: 'Managing rust during the rainy season.',
          content: 'Orange powdery spots on leaf undersides indicate rust. Prune coffee bushes to improve airflow. Apply copper-based fungicides before the onset of rains.'
      },
      {
          id: '3', title: 'Soil Acidity Management', category: 'Soil',
          summary: 'How to use lime to improve yields.',
          content: 'If crops are yellowing, your soil may be acidic. Apply agricultural lime 2 weeks before planting. Mix thoroughly with the topsoil.'
      },
      {
          id: '4', title: 'Water Conservation', category: 'Water',
          summary: 'Mulching techniques for dry seasons.',
          content: 'Cover soil with dry grass or crop residues (mulch). This retains moisture, suppresses weeds, and adds organic matter as it decomposes.'
      }
  ];

  const getQuickChips = () => {
      if (language === 'sw') return ["Tambua mdudu huyu 🐛", "Jinsi ya kuua vidukari?", "Bei ya Mahindi Nairobi", "Mvua itanyesha lini?"];
      if (language === 'ki') return ["Ni kii giki? 🐛", "Madawa ma kii?", "Bei ya Mbembe", "Mbura ikura ri?"];
      return ["Identify this pest 🐛", "How to clear aphids?", "Maize prices in Nairobi", "When will rains start?"];
  };

  const quickChips = getQuickChips();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
        scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, source: 'chat' | 'doctor' = 'chat') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
          // Compress image to max 800px width to save local storage and bandwidth
          const compressedImage = await resizeImage(file, 800, 0.7);
          setSelectedImage(compressedImage);
          if(source === 'doctor') showToast("Image selected. Click 'Diagnose' to proceed.", "info");
      } catch (error) {
          console.error("Image processing error", error);
          showToast("Failed to process image. Try a smaller one.", "error");
      }
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !selectedImage) || loading) return;

    const finalMessageText = textToSend || (selectedImage ? (language === 'sw' ? "Tambua shida ya mmea huu." : "Diagnose this crop issue.") : "");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: finalMessageText,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = selectedImage ? selectedImage.split(',')[1] : undefined; 
    setSelectedImage(null);
    setLoading(true);
    
    if (activeTab === 'doctor') {
        setActiveTab('chat');
    }

    try {
        const history = messages.map(m => ({
            role: m.role,
            text: m.text,
        }));

        const responseText = await generateChatResponse(finalMessageText, history, language, imageToSend);
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error("Chat error", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "Pole sana (Sorry), I had trouble connecting. Please check your internet.",
            timestamp: Date.now()
        }]);
        showToast("Connection failed", "error");
    } finally {
        setLoading(false);
    }
  };

  const startDiagnosis = () => {
      if (!selectedImage) return;
      handleSend(language === 'sw' 
        ? "Chunguza picha hii ya mmea. Tambua wadudu au magonjwa yoyote na utoe hatua za matibabu na kinga." 
        : "Diagnose this plant image. Identify any pests or diseases and provide treatment and prevention steps.");
  };

  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); 
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.pitch = 1;
          utterance.rate = 0.9;
          if (language === 'sw') {
              const voices = window.speechSynthesis.getVoices();
              const swVoice = voices.find(v => v.lang.includes('sw'));
              if (swVoice) utterance.voice = swVoice;
          }
          window.speechSynthesis.speak(utterance);
      }
  };

  const handleShare = async (text: string) => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'LIMA Farm Advice',
                  text: text,
              });
              showToast("Shared successfully", "success");
          } catch (error) {
              console.log('Error sharing', error);
          }
      } else {
          navigator.clipboard.writeText(text);
          showToast("Copied to clipboard", "success");
      }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setBookmarks(prev => {
        const isBookmarked = prev.includes(id);
        if (isBookmarked) {
            showToast("Article removed from library", "info");
            return prev.filter(b => b !== id);
        } else {
            showToast("Article saved to library", "success");
            return [...prev, id];
        }
      });
  };

  const clearChat = () => {
      if (confirm('Clear entire chat history?')) {
          setMessages([]);
          localStorage.removeItem('lima_chat_history');
          showToast("Chat history cleared", "success");
      }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Header - Fixed Flex Item */}
      <div className="flex-none bg-white/80 backdrop-blur-md px-4 md:px-6 py-4 shadow-sm border-b border-white/40 flex justify-between items-center z-20">
        <div className="flex items-center space-x-2 md:space-x-4">
             <div className="flex items-center">
                 <Bot className="mr-2 text-emerald-600 w-5 h-5 md:w-6 md:h-6" /> 
                 <div>
                    <h2 className="text-lg md:text-xl font-bold text-emerald-900">LIMA</h2>
                    <p className="text-[10px] md:text-xs text-stone-500 block">AI Agronomist</p>
                 </div>
             </div>
             
             {/* Tab Toggle */}
             <div className="flex bg-stone-100/80 p-0.5 rounded-lg md:rounded-xl">
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`px-2 md:px-3 py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'chat' ? 'bg-white shadow text-emerald-800' : 'text-stone-400'}`}
                >
                    Chat
                </button>
                <button 
                    onClick={() => setActiveTab('doctor')}
                    className={`px-2 md:px-3 py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all flex items-center ${activeTab === 'doctor' ? 'bg-white shadow text-emerald-800' : 'text-stone-400'}`}
                >
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Doctor
                </button>
                <button 
                    onClick={() => setActiveTab('library')}
                    className={`px-2 md:px-3 py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'library' ? 'bg-white shadow text-emerald-800' : 'text-stone-400'}`}
                >
                    Library
                </button>
             </div>
        </div>
        
        {/* Language Dropdown & Clear Chat */}
        <div className="flex items-center gap-2">
            {activeTab === 'chat' && (
                <button 
                    onClick={clearChat}
                    className="p-1.5 md:p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Clear Chat History"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            
            <div className="relative">
                <button 
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center text-[10px] md:text-xs font-bold text-stone-600 bg-white/50 border border-stone-200 px-2 md:px-3 py-1.5 rounded-lg hover:bg-white transition-colors uppercase"
                >
                    <Globe className="w-3 h-3 mr-1.5" />
                    {language}
                    <ChevronDown className="w-3 h-3 ml-1" />
                </button>
                
                {showLangMenu && (
                    <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-stone-100 py-1 z-50 animate-in zoom-in-95 duration-200">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setShowLangMenu(false);
                                    showToast(`Language set to ${lang.label}`, "info");
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 ${language === lang.code ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-stone-600'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <>
            {/* Messages Container - Flex 1 to take available space */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-4 md:space-y-6 min-h-0">
                <div className="max-w-3xl mx-auto w-full space-y-6">
                    {/* Visual Crop Doctor Promo */}
                    {messages.length < 3 && (
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-emerald-100 p-2 rounded-full mr-3">
                                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-emerald-900 text-sm">Visual Crop Doctor</h4>
                                    <p className="text-xs text-emerald-700">{language === 'sw' ? 'Piga picha mmea wako utambue wadudu.' : 'Take a photo of your crop for instant pest diagnosis.'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveTab('doctor')}
                                className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                            >
                                {language === 'sw' ? 'Daktari' : 'Open'}
                            </button>
                        </div>
                    )}

                    {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 md:p-5 shadow-sm relative group backdrop-blur-sm ${
                        msg.role === 'user' 
                            ? 'bg-emerald-600/90 text-white rounded-tr-none shadow-emerald-600/10' 
                            : 'bg-white/80 text-stone-800 rounded-tl-none border border-white/60 shadow-lg'
                        }`}>
                            {msg.image && (
                                <img src={msg.image} alt="Upload" className="w-full h-auto max-h-64 object-cover rounded-xl mb-3 border border-white/20" />
                            )}
                            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <span className={`text-[10px] mt-2 block opacity-70 font-medium ${msg.role === 'user' ? 'text-emerald-100' : 'text-stone-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            
                            {/* Message Actions */}
                            {msg.role === 'model' && (
                                <div className="absolute -right-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={() => speakText(msg.text)}
                                        className="p-2 rounded-full bg-white/50 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 backdrop-blur-md border border-white/50 shadow-sm"
                                        title="Read Aloud"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleShare(msg.text)}
                                        className="p-2 rounded-full bg-white/50 text-stone-400 hover:text-blue-600 hover:bg-blue-50 backdrop-blur-md border border-white/50 shadow-sm"
                                        title="Share"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    ))}
                    {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/80 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2 border border-white/50">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                    </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Flex None to stay at bottom, padded for bottom nav clearance */}
            <div className="flex-none bg-white/80 backdrop-blur-md border-t border-white/40 p-4 md:p-6 pb-24 md:pb-6 z-20 w-full">
                <div className="max-w-3xl mx-auto w-full">
                    {/* Quick Chips */}
                    {!loading && messages.length < 5 && (
                        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            {quickChips.map((chip, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSend(chip)}
                                    className="whitespace-nowrap bg-white/50 border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 text-xs px-4 py-2 rounded-full transition-all flex items-center font-medium shadow-sm"
                                >
                                    <Zap className="w-3 h-3 mr-1.5 text-amber-500" />
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedImage && (
                    <div className="mb-3 inline-flex items-center bg-stone-100 border border-stone-200 px-4 py-2 rounded-lg text-xs text-stone-600 font-medium">
                        <ImageIcon className="w-4 h-4 mr-2 text-stone-500" /> Image attached 
                        <button onClick={() => setSelectedImage(null)} className="ml-3 text-stone-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                    )}

                    <div className="flex items-center gap-2 md:gap-3">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors border border-transparent hover:border-emerald-100 bg-stone-50"
                        >
                            <ImageIcon className="w-6 h-6" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageSelect(e, 'chat')}
                        />
                        
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={language === 'sw' ? 'Uliza...' : 'Ask LIMA...'}
                            className="flex-1 bg-white/50 border border-stone-300 text-stone-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 md:p-4 shadow-sm outline-none transition-all"
                        />
                        
                        <button 
                            onClick={() => handleSend()}
                            disabled={loading || (!input && !selectedImage)}
                            className={`p-3 md:p-4 rounded-2xl transition-all shadow-md ${
                                loading || (!input && !selectedImage)
                                ? 'bg-stone-200 text-stone-400 shadow-none' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-600/20'
                            }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
      ) : activeTab === 'doctor' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col items-center justify-center pb-24">
              <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-6 md:p-8 text-center animate-in zoom-in-95 duration-300">
                  <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Stethoscope className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-2">{language === 'sw' ? 'Daktari wa Mimea' : 'Visual Crop Doctor'}</h3>
                  <p className="text-stone-500 mb-8 leading-relaxed text-sm md:text-base">
                      {language === 'sw' ? 'Piga picha mmea ulioathirika. AI itatambua wadudu au ugonjwa na kupendekeza matibabu.' : 'Take a photo of your affected crop. Our AI will identify the pest or disease and recommend treatment.'}
                  </p>

                  <div 
                    onClick={() => doctorInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 mb-8 cursor-pointer transition-all group ${
                        selectedImage 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-stone-300 hover:border-emerald-400 hover:bg-white/50'
                    }`}
                  >
                      <input 
                          type="file" 
                          ref={doctorInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e, 'doctor')}
                      />
                      
                      {selectedImage ? (
                          <div className="relative">
                              <img src={selectedImage} alt="Crop" className="rounded-xl shadow-lg max-h-64 mx-auto" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                                className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full shadow-md border border-stone-100 hover:bg-red-50 transition-colors"
                              >
                                  <X className="w-5 h-5" />
                              </button>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center text-stone-400 group-hover:text-emerald-600">
                              <Camera className="w-16 h-16 mb-4 drop-shadow-sm" />
                              <span className="font-bold text-lg">{language === 'sw' ? 'Bofya kupiga picha' : 'Tap to Take Photo'}</span>
                              <span className="text-sm mt-1 opacity-70">{language === 'sw' ? 'au pakia kutoka kwa simu' : 'or upload from gallery'}</span>
                          </div>
                      )}
                  </div>

                  <button 
                      onClick={startDiagnosis}
                      disabled={!selectedImage || loading}
                      className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                          !selectedImage 
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-600/30'
                      }`}
                  >
                      {loading ? (
                          <span className="flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin mr-2" /> {language === 'sw' ? 'Inachambua...' : 'Analyzing...'}
                          </span>
                      ) : (
                          language === 'sw' ? 'Tambua Tatizo' : "Diagnose Issue"
                      )}
                  </button>
              </div>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24">
              <div className="max-w-4xl mx-auto w-full">
                  <div className="mb-6 md:mb-8 flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-stone-800 mb-2">Knowledge Library</h3>
                        <p className="text-stone-500">Expert guides for common farming challenges.</p>
                      </div>
                      {bookmarks.length > 0 && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                              {bookmarks.length} Saved
                          </span>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {knowledgeArticles.map(article => (
                          <div key={article.id} className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group relative">
                              <button 
                                onClick={(e) => toggleBookmark(article.id, e)}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                                    bookmarks.includes(article.id)
                                    ? 'text-amber-500 bg-amber-50'
                                    : 'text-stone-300 hover:bg-stone-100'
                                }`}
                              >
                                  <Bookmark className={`w-5 h-5 ${bookmarks.includes(article.id) ? 'fill-amber-500' : ''}`} />
                              </button>
                              
                              {/* Audio Button */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); speakText(article.content); }}
                                className="absolute top-4 right-14 p-2 rounded-full text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                title="Listen"
                              >
                                  <Volume2 className="w-5 h-5" />
                              </button>
                              
                              <div className="flex justify-between items-start mb-4 pr-20">
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                                      article.category === 'Pests' ? 'bg-red-50 text-red-600 border-red-100' :
                                      article.category === 'Soil' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                      'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                      {article.category}
                                  </span>
                              </div>
                              <h4 className="font-bold text-lg text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">{article.title}</h4>
                              <p className="text-sm text-stone-600 leading-relaxed">{article.content}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AgronomyChat;
