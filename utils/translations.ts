
import { Language } from '../types';

interface Dictionary {
    [key: string]: {
        en: string;
        sw: string;
    }
}

export const translations: Dictionary = {
    // Auth
    'welcome_title': { en: 'Welcome to', sw: 'Karibu' },
    'welcome_subtitle': { en: 'Intelligent Farming for Everyone', sw: 'Kilimo Bora kwa Wote' },
    'login': { en: 'Login', sw: 'Ingia' },
    'register': { en: 'Create Account', sw: 'Fungua Akaunti' },
    'name': { en: 'Full Name', sw: 'Jina Kamili' },
    'location': { en: 'Location (County)', sw: 'Mahali (Kaunti)' },
    'password': { en: 'Password', sw: 'Nenosiri' },
    'confirm_password': { en: 'Confirm Password', sw: 'Thibitisha Nenosiri' },
    'already_account': { en: 'Already have an account?', sw: 'Una akaunti tayari?' },
    'no_account': { en: "Don't have an account?", sw: 'Huna akaunti?' },
    'sign_in': { en: 'Sign In', sw: 'Ingia' },
    'sign_up': { en: 'Sign Up', sw: 'Jisajili' },
    
    // Navigation
    'nav_home': { en: 'Home', sw: 'Nyumbani' },
    'nav_journal': { en: 'Journal', sw: 'Shajara' },
    'nav_market': { en: 'Market', sw: 'Soko' },
    'nav_climate': { en: 'Climate', sw: 'Hali ya Hewa' },
    'nav_insurance': { en: 'Insurance', sw: 'Bima' },
    'nav_expert': { en: 'Expert', sw: 'Mtaalam' },
    'nav_voice': { en: 'Voice', sw: 'Sauti' },
    'nav_profile': { en: 'Profile', sw: 'Wasifu' },

    // Dashboard
    'dashboard_title': { en: 'Dashboard', sw: 'Dashibodi' },
    'btn_expense': { en: 'Expense', sw: 'Gharama' },
    'btn_harvest': { en: 'Harvest', sw: 'Mavuno' },
    'farm_pulse': { en: 'Farm Pulse', sw: 'Hali ya Shamba' },
    'open_journal': { en: 'Open Journal', sw: 'Fungua Shajara' },
    'ai_analysis': { en: 'AI Analysis', sw: 'Uchambuzi wa AI' },
    'today_insight': { en: "Today's Insight", sw: 'Ushauri wa Leo' },

    // Journal
    'journal_title': { en: 'Journal', sw: 'Shajara' },
    'plan_season': { en: 'Plan Season', sw: 'Panga Msimu' },
    'add_entry': { en: 'Add Entry', sw: 'Weka Rekodi' },
    'no_entries': { en: 'No journal entries yet.', sw: 'Hakuna rekodi bado.' },
    'save_entry': { en: 'Save Entry', sw: 'Hifadhi' },
    'cancel': { en: 'Cancel', sw: 'Ghairi' },
    
    // Settings/Misc
    'settings': { en: 'Settings', sw: 'Mipangilio' },
    'dark_mode': { en: 'Dark Mode', sw: 'Hali ya Giza' },
    'light_mode': { en: 'Light Mode', sw: 'Hali ya Mwanga' },
    'system_mode': { en: 'System', sw: 'Mfumo' },
    'language': { en: 'Language', sw: 'Lugha' },
    'tour_skip': { en: 'Skip Tour', sw: 'Ruka Maelekezo' },
    'tour_next': { en: 'Next', sw: 'Mbele' },
    'tour_finish': { en: 'Finish', sw: 'Maliza' },
    'logout': { en: 'Logout', sw: 'Ondoka' },
};

export const t = (key: string, lang: Language): string => {
    // Fallback to English if key missing or specific lang missing
    // Treat other dialects as Swahili for UI text for now, or English default
    const effectiveLang = (lang === 'sw' || lang === 'ki' || lang === 'luo' || lang === 'luy') ? 'sw' : 'en';
    
    if (translations[key] && translations[key][effectiveLang]) {
        return translations[key][effectiveLang];
    }
    return translations[key]?.en || key;
};
