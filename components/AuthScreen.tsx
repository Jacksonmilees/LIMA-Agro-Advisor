
import React, { useState } from 'react';
import { Sprout, Mail, Lock, User, MapPin, ArrowRight, Loader2, Globe, Eye, EyeOff } from 'lucide-react';
import { UserProfile, AuthView, Language } from '../types';
import { t } from '../utils/translations';

interface AuthScreenProps {
    onLogin: (profile: UserProfile) => void;
    currentView: AuthView;
    setView: (view: AuthView) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, currentView, setView, language, setLanguage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // Fast mock login
        setTimeout(() => {
            const storedUsersStr = localStorage.getItem('lima_users_db');
            const storedUsers: UserProfile[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
            
            // Check against stored users or allow generic "demo" login for testing if empty
            const user = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            
            if (user) {
                onLogin(user);
            } else if (email === 'demo@lima.co.ke' && password === '1234') {
                 // Fallback demo user
                 onLogin({
                     id: 'demo-user',
                     name: 'Juma Hamisi',
                     email: 'demo@lima.co.ke',
                     location: 'Eldoret',
                     farmSize: '2 Acres',
                     soilType: 'Loam',
                     crops: ['Maize', 'Beans']
                 });
            } else {
                setError('Invalid email or password');
                setLoading(false);
            }
        }, 600);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            if (!email || !password || !name) {
                setError('Please fill all fields');
                setLoading(false);
                return;
            }

            const newUser: UserProfile = {
                id: Date.now().toString(),
                email,
                password,
                name,
                location: location || 'Nairobi',
                farmSize: '1 Acre',
                soilType: 'Loam',
                crops: ['Maize'],
            };

            // Save to "DB"
            const storedUsersStr = localStorage.getItem('lima_users_db');
            const storedUsers: UserProfile[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
            storedUsers.push(newUser);
            localStorage.setItem('lima_users_db', JSON.stringify(storedUsers));

            // Init empty data for this user
            localStorage.setItem(`lima_data_${newUser.id}_harvests`, '[]');
            localStorage.setItem(`lima_data_${newUser.id}_expenses`, '[]');

            onLogin(newUser);
        }, 600);
    };

    return (
        <div className="h-[100dvh] w-full relative overflow-y-auto bg-stone-100 dark:bg-stone-950 transition-colors duration-500">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none fixed">
                <div className="absolute top-0 left-0 w-full h-[55%] bg-emerald-700 dark:bg-emerald-900 rounded-b-[3rem] shadow-2xl"></div>
                <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-40 right-20 w-60 h-60 bg-yellow-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="min-h-full w-full flex items-center justify-center py-10 relative z-10">
                <div className="w-full max-w-md px-6">
                    {/* Language Toggle */}
                    <div className="absolute top-4 right-4 md:right-auto md:left-1/2 md:ml-[230px] md:top-auto flex justify-end z-20">
                        <button 
                            onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
                            className="bg-black/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center hover:bg-black/30 transition-all"
                        >
                            <Globe className="w-3 h-3 mr-2" /> {language === 'sw' ? 'English' : 'Kiswahili'}
                        </button>
                    </div>

                    {/* Logo Section */}
                    <div className="text-center mb-8 mt-4 md:mt-0">
                        <div className="inline-flex p-4 bg-white dark:bg-stone-800 rounded-3xl shadow-xl mb-4">
                            <Sprout className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">LIMA</h1>
                        <p className="text-emerald-50 font-medium text-lg drop-shadow-sm">{t('welcome_subtitle', language)}</p>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/50 dark:border-stone-700 animate-in slide-in-from-bottom-8 duration-500">
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6 text-center">
                            {currentView === AuthView.LOGIN ? t('login', language) : t('register', language)}
                        </h2>

                        <form onSubmit={currentView === AuthView.LOGIN ? handleLogin : handleRegister} className="space-y-4">
                            {currentView === AuthView.REGISTER && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-stone-500 dark:text-stone-300 uppercase ml-1">{t('name', language)}</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-white outline-none transition-all placeholder:text-stone-400"
                                                placeholder="e.g. Juma Hamisi"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-stone-500 dark:text-stone-300 uppercase ml-1">{t('location', language)}</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                                            <input 
                                                type="text" 
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-white outline-none transition-all placeholder:text-stone-400"
                                                placeholder="e.g. Eldoret"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-500 dark:text-stone-300 uppercase ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-white outline-none transition-all placeholder:text-stone-400"
                                        placeholder="juma@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-500 dark:text-stone-300 uppercase ml-1">{t('password', language)}</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-white outline-none transition-all placeholder:text-stone-400"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-800">
                                    <p className="text-red-600 dark:text-red-300 text-sm text-center font-bold">{error}</p>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center mt-6 text-lg"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        {currentView === AuthView.LOGIN ? t('sign_in', language) : t('sign_up', language)}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 text-center">
                            <p className="text-stone-500 dark:text-stone-400 text-sm mb-3">
                                {currentView === AuthView.LOGIN ? t('no_account', language) : t('already_account', language)}
                            </p>
                            <button 
                                onClick={() => setView(currentView === AuthView.LOGIN ? AuthView.REGISTER : AuthView.LOGIN)}
                                className="w-full py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                            >
                                {currentView === AuthView.LOGIN ? t('register', language) : t('login', language)}
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-center text-xs text-stone-400 mt-8">
                        &copy; 2025 LIMA Intelligent Farming.
                    </p>
                </div>
            </div>
        </div>
    );
};
