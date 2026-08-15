export interface BaselineData {
  // Step 1 — Demographics
  age?: number;
  gender?: string;

  // Step 2 — Lifestyle
  occupationType?: string;
  scheduleStart?: string;
  scheduleEnd?: string;
  sleepTime?: string;
  wakeTime?: string;

  // Step 3 — Recovery History
  previousAttempts?: string;
  professionalSupport?: string;
  motivationLevel?: number; // 1-10

  // Step 4 — Recovery Profile
  recoveryDurationMonths?: number;
  triggers?: string[];

  // Step 5 — Support & Wellbeing
  socialSupportLevel?: number; // 1-10
  baselineAnxiety?: number; // 1-10
  sleepPattern?: string;
  copingStrategies?: string[];
}

export interface TrackingEntry {
  date: string; // ISO date
  mood: number; // 1-10
  stress: number; // 1-10
  anxiety: number; // 1-10
  energy: number; // 1-10
  sleepQuality: 'good' | 'okay' | 'poor';
  triggerEncountered: boolean;
  motivationToday: number; // 1-10
  routineConsistency: number; // 1-10
  copingStrategiesUsed: string[];
}

// Alcohol Craving Questionnaire — Short Form Revised (ACQ-SF-R), Singleton 1997.
// 12 items, 1 (Strongly Disagree) - 7 (Strongly Agree). Items 3, 8, 11 are reverse-keyed.
export interface CravingEntry {
  date: string;
  responses: Record<number, number>; // item number (1-12) -> raw 1-7 rating
  compulsivity: number; // items 4,5,6
  expectancy: number; // items 1,2,12
  purposefulness: number; // items 3*,8*,11*
  emotionality: number; // items 7,9,10
  generalIndex: number; // mean of all 12 (reverse-scored where applicable)
  cravingIntensity10: number; // generalIndex rescaled to 1-10 for dashboard use
}

export interface RealtimeEntry {
  date: string;
  riskLevel: number; // 1-10
  trigger: string;
  copingAction: string;
  confidence: number; // 1-10, confidence in resisting
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface AppData {
  baseline: BaselineData | null;
  baselineComplete: boolean;
  tracking: TrackingEntry[];
  craving: CravingEntry[];
  realtime: RealtimeEntry[];
  chat: ChatMessage[];
}
