# DigiCBT — Alcohol Recovery System

A React Native (Expo) mobile app for alcohol cessation, built to follow the
"DigiCBT Recovery System" dashboard design from Figma Make — with the
login/auth screen removed so the app opens straight into the baseline setup.

## Flow

1. **Baseline Setup** (one-time, 6 steps) — Demographics (age, gender first),
   Lifestyle, Recovery History, Recovery Profile, Support & Wellbeing, Review.
2. **Daily Check-In** — mood/stress/anxiety/energy sliders, sleep quality,
   triggers, motivation, routine, coping strategies. Submitting opens the
   craving questionnaire automatically.
3. **Craving Questionnaire** — the real **ACQ-SF-R** (Alcohol Craving
   Questionnaire, Short Form Revised; Singleton, 1997), 12 items on a 1–7
   scale, scored with the published reverse-keying and 4-factor formula
   (Compulsivity, Expectancy, Purposefulness, Emotionality).
4. **Real-Time Support** — log a high-risk moment: risk level, trigger,
   coping action, confidence in resisting.
5. **Analysis & Insights** — Relapse Risk Score, Emotional Wellbeing,
   Behavioral Stability, a 7-day mood/stress/craving trend chart, and
   personalized recommendations.
6. **Chat Support** — a lightweight, local (offline, no API key) supportive
   companion that reacts to keywords and your recent check-in data.

All data is stored locally on-device via AsyncStorage — nothing is sent
anywhere. There is no login; the app is single-user by design, matching the
Figma source ("disable the login section, go direct to the work").

## Run it

```bash
npm install
npm run android   # or: npm run ios / npm run web
```

Requires the Expo Go app (or a simulator) — see https://docs.expo.dev.

## Project layout

```
App.tsx            orchestrates the tab flow + persistence
screens/            Onboarding, CheckIn, Craving, Realtime, Analysis, Chat
components/          shared UI: cards, sliders, chips, charts, tab bar
lib/scoring.ts       ACQ-SF-R scoring + relapse/wellbeing/stability formulas
lib/storage.ts       AsyncStorage read/write
theme.ts             colors, spacing, radius — ported from the Figma design
types.ts             shared data models
```

## Notes / next steps

- Not a diagnostic tool — the ACQ-SF-R is a validated screener, but this app
  is a personal-tracking aid, not a substitute for professional care.
- Chat Support uses simple keyword matching locally; swap in a real LLM API
  if you want it to be genuinely conversational.
- Time fields (work hours, sleep/wake) are free-text for now — a native time
  picker would be a nice upgrade.
