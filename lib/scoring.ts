import { CravingEntry, RiskLevel, TrackingEntry } from '../types';

// ---- Alcohol Craving Questionnaire — Short Form Revised (ACQ-SF-R) ----
// Singleton, E.G. (1997). 12 items drawn from the 47-item ACQ-NOW.
// Each item is rated 1 (Strongly Disagree) to 7 (Strongly Agree).
// Items 3, 8 and 11 are reverse-keyed: reverse score = 8 - raw score.
export const ACQ_ITEMS: { id: number; text: string; reverse: boolean }[] = [
  { id: 1, text: 'If I had some alcohol, I would probably drink it.', reverse: false },
  { id: 2, text: 'I miss drinking.', reverse: false },
  { id: 3, text: 'I am not making any plans to drink.', reverse: true },
  { id: 4, text: 'I could not stop myself from drinking if I had some alcohol here.', reverse: false },
  { id: 5, text: 'I want to drink so bad I can almost taste it.', reverse: false },
  { id: 6, text: 'I would feel less irritable if I used alcohol now.', reverse: false },
  { id: 7, text: 'If I used alcohol, I would feel less tense.', reverse: false },
  { id: 8, text: 'Drinking would not be very satisfying.', reverse: true },
  { id: 9, text: 'I would feel less restless if I drank alcohol.', reverse: false },
  { id: 10, text: 'If I were using alcohol, I would feel less nervous.', reverse: false },
  { id: 11, text: 'It would be easy to pass up the chance to use alcohol.', reverse: true },
  { id: 12, text: 'Drinking would put me in a better mood.', reverse: false },
];

function scored(responses: Record<number, number>, id: number): number {
  const item = ACQ_ITEMS.find((i) => i.id === id)!;
  const raw = responses[id] ?? 4;
  return item.reverse ? 8 - raw : raw;
}

export function scoreCraving(responses: Record<number, number>): Omit<CravingEntry, 'date' | 'responses'> {
  const compulsivity = (scored(responses, 4) + scored(responses, 5) + scored(responses, 6)) / 3;
  const expectancy = (scored(responses, 1) + scored(responses, 2) + scored(responses, 12)) / 3;
  const purposefulness = (scored(responses, 3) + scored(responses, 8) + scored(responses, 11)) / 3;
  const emotionality = (scored(responses, 7) + scored(responses, 9) + scored(responses, 10)) / 3;

  const total = ACQ_ITEMS.reduce((sum, item) => sum + scored(responses, item.id), 0);
  const generalIndex = total / ACQ_ITEMS.length; // 1-7

  // Rescale the 1-7 general index to a friendlier 1-10 "craving intensity" used elsewhere.
  const cravingIntensity10 = ((generalIndex - 1) / 6) * 9 + 1;

  return {
    compulsivity,
    expectancy,
    purposefulness,
    emotionality,
    generalIndex,
    cravingIntensity10,
  };
}

// ---- Analysis & Insights ----

export function calculateRelapseRisk(
  latestTracking: TrackingEntry | undefined,
  latestCraving: CravingEntry | undefined
): { level: RiskLevel; color: 'green' | 'orange' | 'red'; percentage: number } {
  const craving = latestCraving?.cravingIntensity10 ?? 0;
  const stress = latestTracking?.stress ?? 0;
  const motivation = 10 - (latestTracking?.motivationToday ?? 5);
  const triggerImpact = latestTracking?.triggerEncountered ? 20 : 0;

  const risk = craving * 3 + stress * 2 + motivation * 2 + triggerImpact;
  const percentage = Math.min(100, Math.round(risk));

  if (percentage < 30) return { level: 'Low', color: 'green', percentage };
  if (percentage < 60) return { level: 'Moderate', color: 'orange', percentage };
  return { level: 'High', color: 'red', percentage };
}

export function calculateEmotionalWellbeing(latestTracking: TrackingEntry | undefined): number {
  const mood = latestTracking?.mood ?? 5;
  const anxiety = 10 - (latestTracking?.anxiety ?? 5);
  const stress = 10 - (latestTracking?.stress ?? 5);
  const energy = latestTracking?.energy ?? 5;

  const score = ((mood + anxiety + stress + energy) / 40) * 100;
  return Math.round(score);
}

export function calculateBehavioralStability(latestTracking: TrackingEntry | undefined): number {
  const routine = latestTracking?.routineConsistency ?? 5;
  const sleepScore =
    latestTracking?.sleepQuality === 'good' ? 10 : latestTracking?.sleepQuality === 'okay' ? 6 : 3;
  const copingScore = Math.min(10, (latestTracking?.copingStrategiesUsed?.length ?? 0) * 2.5);

  const score = ((routine + sleepScore + copingScore) / 30) * 100;
  return Math.round(score);
}

export function buildRecommendations(
  risk: { level: RiskLevel },
  wellbeing: number,
  stability: number,
  latestTracking: TrackingEntry | undefined
): string[] {
  const tips: string[] = [];

  if (risk.level === 'High') {
    tips.push('Your relapse risk is elevated right now — consider using Real-Time Support to log what you’re feeling and reach out to someone in your support network.');
  } else if (risk.level === 'Moderate') {
    tips.push('Your risk is moderate today. A short walk, a call to a supportive friend, or a coping strategy from your plan can help bring it back down.');
  } else {
    tips.push('Your relapse risk is low right now — this is a good time to reinforce the routines that are working for you.');
  }

  if (wellbeing < 50) {
    tips.push('Your emotional wellbeing score is lower than usual. Try a grounding or breathing exercise, and be gentle with yourself today.');
  }

  if (stability < 50) {
    tips.push('Your routine and sleep have been less consistent lately. Small, repeatable habits — a fixed wake time, a short walk — help rebuild stability.');
  }

  if (latestTracking?.triggerEncountered) {
    tips.push('You logged a trigger recently. Reviewing what preceded it can help you spot the pattern earlier next time.');
  }

  if (tips.length === 1) {
    tips.push('Keep logging your daily check-ins — the more consistent your data, the more accurate these insights become.');
  }

  return tips;
}
