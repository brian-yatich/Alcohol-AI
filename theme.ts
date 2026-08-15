// Design tokens ported from the "DigiCBT Recovery System" Figma Make dashboard design.
export const colors = {
  bg: '#111827', // gray-900 app shell background
  surface: '#ffffff',
  surfaceMuted: '#f9fafb', // gray-50
  border: '#e5e7eb', // gray-200
  borderStrong: '#d1d5db', // gray-300

  textPrimary: '#111827', // gray-900
  textSecondary: '#4b5563', // gray-600
  textMuted: '#9ca3af', // gray-400
  textOnDark: '#f9fafb',
  textOnDarkMuted: '#9ca3af',

  primary: '#2563eb', // blue-600, active tab / primary actions
  primaryMuted: '#dbeafe', // blue-100

  gradientStart: '#7c3aed', // purple-600
  gradientEnd: '#ec4899', // pink-500

  success: '#22c55e', // green-500
  successMuted: '#dcfce7',
  warning: '#f97316', // orange-500
  warningMuted: '#ffedd5',
  danger: '#ef4444', // red-500
  dangerMuted: '#fee2e2',

  purple: '#9333ea',
  purpleMuted: '#f3e8ff',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;
