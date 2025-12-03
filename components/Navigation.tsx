
import React from 'react';
import { LayoutDashboard, LineChart, MessageCircle, Mic, Sprout, UserCog, ClipboardList, Bell, CloudRain, ShieldCheck } from 'lucide-react';
import { AppView, UserProfile, Language } from '../types';
import { t } from '../utils/translations';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userProfile: UserProfile;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  language: Language;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, userProfile, unreadNotifications, onOpenNotifications, language }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: t('nav_home', language), icon: LayoutDashboard },
    { id: AppView.JOURNAL, label: t('nav_journal', language), icon: ClipboardList },
    { id: AppView.MARKET, label: t('nav_market', language), icon: LineChart },
    { id: AppView.CLIMATE, label: t('nav_climate', language), icon: CloudRain },
    { id: AppView.INSURANCE, label: t('nav_insurance', language), icon: ShieldCheck },
    { id: AppView.CHAT, label: t('nav_expert', language), icon: MessageCircle },
    { id: AppView.VOICE, label: t('nav_voice', language), icon: Mic },
    { id: AppView.PROFILE, label: t('nav_profile', language), icon: UserCog },
  ];

  return (
    <>
      {/* Mobile Header with Notification Bell */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-stone-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 z-50 flex items-center justify-between px-6 shadow-sm transition-colors duration-300">
         <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-emerald-900 dark:text-emerald-100 tracking-tight">LIMA</span>
         </div>
         <button 
            id="mobile-notif-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
         >
            <Bell className="w-6 h-6 text-stone-600 dark:text-stone-300" />
            {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-stone-900 animate-pulse"></span>
            )}
         </button>
      </div>

      {/* Mobile Floating Bottom Navigation - Glass Capsule */}
      <nav id="mobile-nav" className="md:hidden fixed bottom-6 left-4 right-4 bg-stone-900/90 dark:bg-stone-800/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-50 h-16 rounded-2xl flex items-center justify-between px-2 safe-area-bottom overflow-x-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group relative flex flex-col items-center justify-center min-w-[3.5rem] h-full transition-all duration-300`}
              >
                 {isActive && (
                     <div className="absolute top-0 w-8 h-1 bg-emerald-500 rounded-b-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                 )}
                <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? 'translate-y-1' : ''}`}>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400 fill-emerald-400/20' : 'text-stone-400 group-hover:text-stone-200'}`} />
                </div>
              </button>
            );
          })}
      </nav>

      {/* Desktop/Tablet Top Navigation - Dark Glass Effect */}
      <nav className="hidden md:flex bg-emerald-950/90 dark:bg-stone-900/95 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl z-50 sticky top-0 px-8 h-20 items-center justify-between transition-all">
          {/* Logo Area */}
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight leading-none text-white">LIMA</h1>
                <p className="text-[10px] text-emerald-400/80 uppercase tracking-[0.2em] font-medium mt-1">Intelligent Farming</p>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex items-center justify-center space-x-1 lg:space-x-2 flex-1 px-4">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`group relative flex items-center space-x-2 px-3 py-2.5 rounded-2xl transition-all duration-300 text-sm font-medium overflow-hidden ${
                            isActive 
                            ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/30' 
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-100/50 group-hover:text-white'}`} />
                        <span className="hidden xl:inline">{item.label}</span>
                    </button>
                )
            })}
          </div>

          {/* Right Area: Notifications & Profile */}
          <div className="flex items-center gap-6">
              <button 
                onClick={onOpenNotifications}
                className="relative p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-emerald-950 animate-pulse"></span>
                  )}
              </button>

              <button 
                    onClick={() => onNavigate(AppView.PROFILE)}
                    className="flex items-center space-x-4 pl-6 border-l border-white/10 group"
                >
                    <div className="text-right hidden lg:block opacity-90 group-hover:opacity-100 transition-opacity">
                        <p className="text-sm font-bold text-white truncate max-w-[120px]">{userProfile.name}</p>
                        <p className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-500/20">Pro Plan</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 p-0.5 shadow-lg group-hover:shadow-emerald-500/20 transition-all">
                        <div className="w-full h-full rounded-full bg-emerald-950 overflow-hidden relative">
                            {userProfile.profileImage ? (
                                <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                    {userProfile.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </button>
          </div>
      </nav>
    </>
  );
};

export default Navigation;
