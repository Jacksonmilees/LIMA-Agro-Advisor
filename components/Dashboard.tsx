
import React, { useState, useEffect } from 'react';
import { Calendar, CloudRain, MapPin, Droplets, Wind, Plus, ArrowRight, Sprout } from 'lucide-react';
import { AppView, FarmRecord, ExpenseRecord, Reminder, UserProfile, Language, WeatherInsight } from '../types';

interface DashboardProps {
    onNavigate: (view: AppView) => void; 
    harvests: FarmRecord[];
    expenses: ExpenseRecord[];
    reminders: Reminder[];
    onAddRecord: () => void;
    onAddExpense: () => void;
    onToggleReminder: (id: string) => void;
    onDeleteReminder: (id: string) => void;
    userProfile: UserProfile;
    language: Language;
    loadingWeather: boolean;
    weather: WeatherInsight | null;
    journalInsight: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    onNavigate, 
    harvests, 
    expenses, 
    reminders, 
    onAddRecord, 
    onAddExpense, 
    onToggleReminder, 
    onDeleteReminder, 
    userProfile, 
    language, 
    loadingWeather, 
    weather, 
    journalInsight 
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
     let locale = 'en-KE';
     if (language === 'sw') locale = 'sw-KE';
     setCurrentDate(new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, [language]);

  return (
    <div className="p-4 md:p-10 pb-32 md:pb-10 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full relative z-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800 tracking-tight leading-tight">{language === 'sw' ? 'Dashibodi' : 'Dashboard'}</h1>
          <p className="text-stone-500 text-xs md:text-sm font-semibold flex items-center mt-2 uppercase tracking-wide">
             <Calendar className="w-4 h-4 mr-2 text-emerald-600" /> {currentDate}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/40 shadow-lg">
            <button onClick={onAddExpense} className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 px-4 py-3 rounded-xl text-xs md:text-sm font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" /> {language === 'sw' ? 'Gharama' : 'Expense'}
            </button>
            <button onClick={onAddRecord} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" /> {language === 'sw' ? 'Mavuno' : 'Harvest'}
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          <div className="md:col-span-7 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[2rem] p-6 md:p-8 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden group min-h-[260px] border border-white/10" onClick={() => onNavigate(AppView.CLIMATE)}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/20 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>
            
            {loadingWeather ? (
               <div className="flex flex-col h-full justify-between animate-pulse relative z-10">
                   <div className="w-32 h-6 bg-white/10 rounded-full"></div>
                   <div className="space-y-4">
                       <div className="w-1/2 h-20 bg-white/10 rounded-2xl"></div>
                       <div className="w-1/3 h-4 bg-white/10 rounded"></div>
                   </div>
                   <div className="w-full h-24 bg-white/5 rounded-2xl mt-4"></div>
               </div>
            ) : weather ? (
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between h-full gap-6 cursor-pointer">
                <div className="space-y-4 md:space-y-6">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase border border-white/10 shadow-inner">
                        <CloudRain className="w-3 h-3 mr-2" /> {weather.condition}
                    </div>
                    <div>
                        <h2 className="text-6xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-200">{weather.temp}</h2>
                        <p className="text-emerald-100/80 mt-2 flex items-center font-medium text-sm md:text-lg">
                            <MapPin className="w-4 h-4 mr-2" /> {userProfile.location}, Kenya
                        </p>
                    </div>
                </div>
                
                <div className="flex-1 bg-black/10 backdrop-blur-sm rounded-2xl p-5 border border-white/5 md:self-stretch flex flex-col justify-center">
                   <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-2">Today's Insight</p>
                   <p className="text-base md:text-lg leading-relaxed font-medium text-white/90 italic">"{weather.tip}"</p>
                   <div className="mt-4 md:mt-6 flex gap-3">
                        <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center border border-white/5">
                            <Droplets className="w-3 h-3 md:w-4 md:h-4 mr-2 text-teal-300" /> 
                            <span className="text-xs md:text-sm font-bold">{weather.humidity}</span>
                        </div>
                        <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center border border-white/5">
                            <Wind className="w-3 h-3 md:w-4 md:h-4 mr-2 text-teal-300" /> 
                            <span className="text-xs md:text-sm font-bold">12 km/h</span>
                        </div>
                   </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="md:col-span-5 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl border border-white/50 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-[50px] -mr-10 -mt-10 opacity-60"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center">
                    <div className="bg-indigo-50 p-2.5 rounded-xl mr-4 border border-indigo-100 shadow-sm">
                        <Sprout className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-stone-800">Farm Pulse</h3>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">AI Analysis</p>
                    </div>
                  </div>
              </div>
              <div className="flex-1 relative z-10 bg-indigo-50/60 rounded-2xl p-5 border border-indigo-100/50">
                  <p className="text-indigo-900 leading-relaxed font-medium text-sm md:text-lg">
                    {journalInsight || "Start logging your daily farm activities in the Journal. I'll learn from your patterns and give you personalized advice here."}
                  </p>
              </div>
              <button onClick={() => onNavigate(AppView.JOURNAL)} className="mt-6 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center relative z-10">
                  Open Journal <ArrowRight className="w-4 h-4 ml-2" />
              </button>
          </div>
      </div>
    </div>
  );
};
