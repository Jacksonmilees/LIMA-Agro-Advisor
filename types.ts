

export type Language = 'en' | 'sw' | 'ki' | 'luo' | 'luy' | 'kal' | 'maa';

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MARKET = 'MARKET',
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  PROFILE = 'PROFILE',
  JOURNAL = 'JOURNAL',
  CLIMATE = 'CLIMATE',
  INSURANCE = 'INSURANCE',
}

export enum AuthView {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ONBOARDING = 'ONBOARDING'
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    type: 'system' | 'activity' | 'alert';
    read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  timestamp: number;
}

export interface MarketDataPoint {
  month: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  type: 'historical' | 'forecast';
}

export interface MarketAnalysis {
  crop: string;
  location: string;
  currentPrice: number;
  currency: string;
  recommendation: 'SELL' | 'HOLD' | 'BUY';
  reasoning: string;
  data: MarketDataPoint[];
}

export interface MarketComparisonItem {
  marketName: string;
  price: number;
  distance: number;
  transportCost: number;
  netPrice: number;
  isBest: boolean;
  contactLead?: string; // e.g. "Mama Mboga Assn: 07..."
}

export interface WeatherInsight {
  temp: string;
  condition: string;
  humidity: string;
  tip: string; // AI generated daily farming tip
}

export interface FarmRecord {
  id: string;
  crop: string;
  amount: number;
  unit: string;
  date: string; // YYYY-MM-DD
  status: 'Sold' | 'Stored' | 'Lost';
  marketName?: string;
  notes?: string;
  estimatedValue?: number; // For revenue calculation
}

export interface ExpenseRecord {
  id: string;
  category: 'Seeds' | 'Fertilizer' | 'Labor' | 'Transport' | 'Equipment' | 'Other';
  amount: number; // Total amount
  quantity?: number;
  unitPrice?: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface FarmActivity {
  id: string;
  type: 'Planting' | 'Fertilizer' | 'Pesticide' | 'Irrigation' | 'Scouting' | 'Harvesting';
  date: string;
  details: string; // e.g., "Applied DAP", "Spotted Armyworm"
  quantity?: string; // e.g. "50kg"
  notes?: string;
}

export interface Reminder {
  id: string;
  text: string;
  date: string; // ISO date string
  completed: boolean;
  type: 'Task' | 'Purchase' | 'Market' | 'Weather';
}

export enum CropType {
  MAIZE = 'Maize',
  BEANS = 'Beans',
  COFFEE = 'Coffee',
  TEA = 'Tea',
  AVOCADO = 'Avocado',
  POTATOES = 'Potatoes',
  TOMATOES = 'Tomatoes',
  ONIONS = 'Onions',
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Pests' | 'Soil' | 'Water' | 'Planting';
  summary: string;
  content: string;
}

export interface UserProfile {
  id?: string;
  email?: string; // Used for "Login" simulation
  password?: string; // Mock password
  name: string;
  location: string;
  farmSize: string;
  soilType: string;
  waterSource?: string;
  crops: string[];
  profileImage?: string;
}

// --- NEW TYPES FOR EXTENSION ---

export interface ClimateRiskData {
  score: number; // 0-100
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: {
    drought: { score: number; rainfallDeficit: number; daysSinceRain: number; label: string };
    vegetation: { score: number; ndviDrop: number; stressLevel: string; label: string };
    soil: { score: number; moisture: number; wiltingDays: number; label: string };
  };
  forecast: {
    day: string;
    temp: number;
    rainProb: number;
    condition: string;
  }[];
  recommendations: {
    id: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    reason: string;
    impact: string;
  }[];
}

export interface InsurancePolicy {
  id: string;
  status: 'ACTIVE' | 'WARNING' | 'EXPIRED';
  coverageAmount: number;
  premium: number;
  daysRemaining: number;
  crop: string;
  provider: string;
  triggers: {
    type: 'Rainfall' | 'Vegetation Health';
    currentValue: string;
    threshold: string;
    status: 'SAFE' | 'WARNING' | 'CRITICAL';
    progress: number; // 0-100% towards trigger
    trend: 'improving' | 'worsening' | 'stable';
  }[];
  payoutEstimation: number;
  claimsHistory: {
      date: string;
      trigger: string;
      amount: number;
      status: 'Paid' | 'Processing';
  }[];
}

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'center';
}
