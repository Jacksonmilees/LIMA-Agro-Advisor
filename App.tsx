
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import MarketForecast from './components/MarketForecast';
import AgronomyChat from './components/AgronomyChat';
import VoiceAssistant from './components/VoiceAssistant';
import FarmProfile from './components/FarmProfile';
import FarmJournal from './components/FarmJournal';
import ClimateDashboard from './components/ClimateDashboard';
import InsurancePortal from './components/InsurancePortal';
import { AuthScreen } from './components/AuthScreen';
import { TourGuide } from './components/TourGuide';
import { ToastContainer } from './components/ToastContainer';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Dashboard } from './components/Dashboard';
import { AddRecordModal } from './components/AddRecordModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { generateWeatherInsight, generateJournalInsights } from './services/geminiService';
import { WeatherInsight, AppView, FarmRecord, ExpenseRecord, UserProfile, Reminder, Language, Toast, FarmActivity, AppNotification, AuthView, ThemeMode, TourStep } from './types';
import { WifiOff, Download, Sun, Moon, Monitor, LogOut, Share, X, Sprout, Plus } from 'lucide-react';
import { safeJSONParse } from './utils/sharedUtils';
import { t } from './utils/translations';

const App: React.FC = () => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>(AuthView.LOGIN);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [weather, setWeather] = useState<WeatherInsight | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosInstall, setShowIosInstall] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [journalInsight, setJournalInsight] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Tour State
  const [runTour, setRunTour] = useState(false);
  
  // Data State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [harvests, setHarvests] = useState<FarmRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [journalActivities, setJournalActivities] = useState<FarmActivity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // --- EFFECTS ---

  // 1. Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
  }, [theme]);

  // 2. Auth Check
  useEffect(() => {
    const activeUser = localStorage.getItem('lima_active_user_id');
    if (activeUser) {
        const storedUsers = safeJSONParse<UserProfile[]>('lima_users_db', []);
        const user = storedUsers.find(u => u.id === activeUser);
        if (user) {
            loginUser(user);
        } else {
            setAuthView(AuthView.LOGIN);
        }
    } else {
        setAuthView(AuthView.LOGIN);
    }
  }, []);

  // 3. Online Status
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); showToast("You are back online", "success"); };
    const handleOffline = () => { setIsOnline(false); showToast("You are offline. LIMA is in offline mode.", "info"); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 4. Data Persistence (Only when user is logged in)
  useEffect(() => {
      if (userProfile && userProfile.id) {
          localStorage.setItem(`lima_data_${userProfile.id}_harvests`, JSON.stringify(harvests));
          localStorage.setItem(`lima_data_${userProfile.id}_expenses`, JSON.stringify(expenses));
          localStorage.setItem(`lima_data_${userProfile.id}_reminders`, JSON.stringify(reminders));
          localStorage.setItem(`lima_data_${userProfile.id}_journal`, JSON.stringify(journalActivities));
          localStorage.setItem(`lima_data_${userProfile.id}_notifications`, JSON.stringify(notifications));
          
          // Update profile in DB
          const storedUsers = safeJSONParse<UserProfile[]>('lima_users_db', []);
          const updatedUsers = storedUsers.map(u => u.id === userProfile.id ? userProfile : u);
          localStorage.setItem('lima_users_db', JSON.stringify(updatedUsers));
      }
  }, [harvests, expenses, reminders, journalActivities, notifications, userProfile]);

  // 5. Load Weather & Insights on Dashboard
  useEffect(() => {
      if (currentView === AppView.DASHBOARD && userProfile) {
        setLoadingWeather(true);
        generateWeatherInsight(userProfile.location, language)
            .then(data => { setWeather(data); setLoadingWeather(false); })
            .catch(() => { setLoadingWeather(false); });
        
        if (journalActivities.length > 0) {
            generateJournalInsights(journalActivities, userProfile, language).then(setJournalInsight);
        }
      }
  }, [language, currentView, journalActivities, userProfile]);

  // 6. Install Logic (Android + iOS)
  useEffect(() => {
      // Android / Desktop
      window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          setInstallPrompt(e);
      });

      // iOS Detection
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      
      if (isIos && !isStandalone) {
          // Show iOS instructions after a small delay
          setTimeout(() => setShowIosInstall(true), 3000);
      }
  }, []);

  // --- ACTIONS ---

  const loginUser = (user: UserProfile) => {
      setUserProfile(user);
      setIsAuthenticated(true);
      localStorage.setItem('lima_active_user_id', user.id || '');
      
      // Load specific user data
      setHarvests(safeJSONParse(`lima_data_${user.id}_harvests`, []));
      setExpenses(safeJSONParse(`lima_data_${user.id}_expenses`, []));
      setReminders(safeJSONParse(`lima_data_${user.id}_reminders`, []));
      setJournalActivities(safeJSONParse(`lima_data_${user.id}_journal`, []));
      setNotifications(safeJSONParse(`lima_data_${user.id}_notifications`, []));

      // Check for first time login tour
      const hasSeenTour = localStorage.getItem(`lima_tour_seen_${user.id}`);
      if (!hasSeenTour) {
          setTimeout(() => setRunTour(true), 1000);
      }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setUserProfile(null);
      localStorage.removeItem('lima_active_user_id');
      setAuthView(AuthView.LOGIN);
  };

  const finishTour = () => {
      setRunTour(false);
      if(userProfile?.id) localStorage.setItem(`lima_tour_seen_${userProfile.id}`, 'true');
  };

  const handleInstallClick = () => {
      if (installPrompt) {
          installPrompt.prompt();
          installPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                  setInstallPrompt(null);
                  showToast("Installing LIMA...", "success");
              }
          });
      }
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
      const newNotif: AppNotification = { id: Date.now().toString(), title, message, timestamp: Date.now(), type, read: false };
      setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3000);
      if (type === 'success' || type === 'error') {
          addNotification(type === 'success' ? 'Success' : 'Alert', message, type === 'error' ? 'alert' : 'activity');
      }
  };

  const removeToast = (id: string) => { setToasts(prev => prev.filter(t => t.id !== id)); };
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // --- RENDER HELPERS ---

  const totalRevenue = harvests.reduce((sum, h) => sum + (h.estimatedValue || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const renderView = () => {
    if (!userProfile) return null;
    switch (currentView) {
      case AppView.MARKET: return <MarketForecast defaultLocation={userProfile.location} language={language} showToast={showToast} />;
      case AppView.CHAT: return <AgronomyChat language={language} setLanguage={setLanguage} showToast={showToast} />;
      case AppView.CLIMATE: return <ClimateDashboard location={userProfile.location} />;
      case AppView.INSURANCE: return <InsurancePortal userProfile={userProfile} />;
      case AppView.JOURNAL: return <FarmJournal activities={journalActivities} onAddActivity={(a) => { setJournalActivities(prev => [a, ...prev]); addNotification("Journal Entry", `Logged ${a.type}`, 'activity'); }} onDeleteActivity={(id) => { setJournalActivities(prev => prev.filter(a => a.id !== id)); showToast("Entry deleted", "info"); }} onAddReminders={(rems) => { setReminders(prev => [...rems, ...prev]); addNotification("Season Plan", `Added ${rems.length} tasks`, 'activity'); }} language={language} showToast={showToast} />;
      case AppView.VOICE: return <VoiceAssistant totalRevenue={totalRevenue} totalExpenses={totalExpenses} harvests={harvests} expenses={expenses} userProfile={userProfile} language={language} onLogHarvest={(r) => { setHarvests(prev => [r, ...prev]); showToast("Harvest logged", "success"); }} onLogExpense={(e) => { setExpenses(prev => [e, ...prev]); showToast("Expense logged", "success"); }} onAddReminder={(rem) => { setReminders(prev => [rem, ...prev]); showToast("Reminder set", "success"); }} />;
      case AppView.PROFILE: return (
        <div>
            <FarmProfile profile={userProfile} onSave={(p) => { setUserProfile(p); showToast("Profile saved", "success"); }} />
            <div className="p-4 md:p-8 max-w-3xl mx-auto">
                <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md p-6 rounded-[2rem] shadow-lg border border-white/50 dark:border-stone-700">
                    <h3 className="font-bold text-lg mb-4 text-stone-800 dark:text-white">{t('settings', language)}</h3>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between p-2">
                            <span className="text-stone-600 dark:text-stone-300 font-medium">{t('dark_mode', language)}</span>
                            <div className="flex bg-stone-100 dark:bg-stone-900 rounded-lg p-1 border border-stone-200 dark:border-stone-700">
                                <button onClick={() => setTheme('light')} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-stone-700 shadow text-emerald-600' : 'text-stone-400'}`}><Sun className="w-5 h-5"/></button>
                                <button onClick={() => setTheme('system')} className={`p-2 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-stone-700 shadow text-emerald-600' : 'text-stone-400'}`}><Monitor className="w-5 h-5"/></button>
                                <button onClick={() => setTheme('dark')} className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-stone-700 shadow text-emerald-600' : 'text-stone-400'}`}><Moon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2">
                             <span className="text-stone-600 dark:text-stone-300 font-medium">{t('language', language)}</span>
                             <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2 text-sm text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-emerald-500"
                             >
                                 <option value="en">English</option>
                                 <option value="sw">Kiswahili</option>
                                 <option value="ki">Gikuyu</option>
                                 <option value="luo">Dholuo</option>
                                 <option value="luy">Luluhya</option>
                             </select>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="mt-4 w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center"
                        >
                            <LogOut className="w-5 h-5 mr-2" /> {t('logout', language)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
      case AppView.DASHBOARD: default: return <Dashboard onNavigate={setCurrentView} harvests={harvests} expenses={expenses} reminders={reminders} onAddRecord={() => setIsHarvestModalOpen(true)} onAddExpense={() => setIsExpenseModalOpen(true)} onToggleReminder={(id) => setReminders(prev => prev.map(r => r.id === id ? {...r, completed: !r.completed} : r))} onDeleteReminder={(id) => { setReminders(prev => prev.filter(r => r.id !== id)); showToast("Reminder deleted", "info"); }} userProfile={userProfile} language={language} loadingWeather={loadingWeather} weather={weather} journalInsight={journalInsight} />;
    }
  };

  const tourSteps: TourStep[] = [
      { targetId: 'mobile-nav', title: 'Navigation', content: 'Use this bar to switch between Dashboard, Market, Journal and more.', position: 'top' },
      { targetId: 'mobile-notif-btn', title: 'Notifications', content: 'See alerts about your farm and weather here.', position: 'bottom' },
  ];

  // --- RENDER ROOT ---

  if (!isAuthenticated) {
      return (
          <>
            <AuthScreen 
                onLogin={loginUser} 
                currentView={authView} 
                setView={setAuthView} 
                language={language}
                setLanguage={setLanguage}
            />
            {/* Native Install Prompt for Android/Desktop on Auth Screen too */}
            {installPrompt && (
                <div className="fixed bottom-6 left-4 right-4 z-[60] md:hidden">
                    <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-700 animate-in slide-in-from-bottom-10">
                        <div className="flex items-center">
                            <div className="bg-emerald-700 p-2 rounded-lg mr-3 border border-emerald-600">
                                <Sprout className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Install LIMA</h4>
                                <p className="text-xs opacity-80">Better experience & offline use</p>
                            </div>
                        </div>
                        <button onClick={handleInstallClick} className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2 rounded-lg text-xs font-bold shadow-lg">
                            Install
                        </button>
                    </div>
                </div>
            )}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
          </>
      );
  }

  const isFullScreenView = currentView === AppView.CHAT || currentView === AppView.VOICE;

  return (
    <div className={`fixed inset-0 md:static md:h-[100dvh] flex flex-col bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 overflow-hidden selection:bg-emerald-200 selection:text-emerald-900 overscroll-none transition-colors duration-300`}>
      <Navigation currentView={currentView} onNavigate={setCurrentView} userProfile={userProfile!} unreadNotifications={notifications.filter(n => !n.read).length} onOpenNotifications={() => setShowNotifications(true)} language={language} />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200/30 dark:bg-emerald-900/10 rounded-full blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-normal"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-normal"></div>
      </div>

      <main 
        className={`flex-1 relative z-10 pt-16 md:pt-0 flex flex-col ${
            isFullScreenView 
            ? 'overflow-hidden' 
            : 'overflow-y-auto scroll-smooth custom-scrollbar overscroll-contain'
        }`}
      >
        {!isOnline && <div className="bg-stone-800 text-white text-xs py-2 px-4 text-center font-semibold flex justify-center items-center sticky top-0 z-30 shadow-md shrink-0"><WifiOff className="w-3 h-3 mr-2" />You are currently offline. Using cached data.</div>}
        {renderView()}
        
        {/* Android / Desktop Install Banner */}
        {installPrompt && (
            <div className="fixed bottom-24 left-4 right-4 z-40 md:hidden">
                 <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 dark:border-stone-200 animate-in slide-in-from-bottom-10">
                     <div className="flex items-center">
                         <div className="bg-emerald-500 p-2 rounded-lg mr-3">
                             <Sprout className="w-5 h-5 text-white" />
                         </div>
                         <div>
                             <h4 className="font-bold text-sm">Install LIMA</h4>
                             <p className="text-xs opacity-80">Add to Home Screen for offline use</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3">
                         <button onClick={() => setInstallPrompt(null)} className="text-white/50 hover:text-white dark:text-stone-400 dark:hover:text-stone-900"><X className="w-5 h-5" /></button>
                         <button onClick={handleInstallClick} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold">Install</button>
                     </div>
                 </div>
            </div>
        )}

        {/* iOS Install Instructions Banner */}
        {showIosInstall && (
            <div className="fixed bottom-24 left-4 right-4 z-40 md:hidden">
                 <div className="bg-stone-900/95 backdrop-blur text-white p-4 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-10 relative">
                     <button onClick={() => setShowIosInstall(false)} className="absolute top-2 right-2 text-white/40 hover:text-white p-1"><X className="w-4 h-4" /></button>
                     <div className="flex items-start gap-3">
                         <div className="bg-white/10 p-2 rounded-lg mt-1">
                             <Share className="w-5 h-5 text-blue-400" />
                         </div>
                         <div className="pr-4">
                             <h4 className="font-bold text-sm mb-1">Install LIMA for iOS</h4>
                             <p className="text-xs opacity-80 mb-2">To install this app on your iPhone:</p>
                             <ol className="text-xs opacity-80 list-decimal ml-4 space-y-1 leading-relaxed">
                                 <li>Tap the <strong>Share</strong> button <Share className="w-3 h-3 inline mx-1" /></li>
                                 <li>Scroll down and tap <strong>Add to Home Screen</strong> <Plus className="w-3 h-3 inline border border-white/50 rounded-[2px] mx-1" /></li>
                             </ol>
                         </div>
                     </div>
                 </div>
            </div>
        )}
      </main>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <NotificationDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onClear={() => setNotifications([])} />
      <AddRecordModal isOpen={isHarvestModalOpen} onClose={() => setIsHarvestModalOpen(false)} onSave={(r) => { setHarvests(prev => [r, ...prev]); showToast("Harvest record saved", "success"); }} />
      <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={(e) => { setExpenses(prev => [e, ...prev]); showToast("Expense record saved", "success"); }} />
      <TourGuide run={runTour} steps={tourSteps} onFinish={finishTour} language={language} />
    </div>
  );
};

export default App;
