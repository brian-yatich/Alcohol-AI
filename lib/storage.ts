import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '../types';

const KEY = 'digicbt-alcohol-recovery/data/v1';

const EMPTY: AppData = {
  baseline: null,
  baselineComplete: false,
  tracking: [],
  craving: [],
  realtime: [],
  chat: [],
};

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage failures are non-fatal for this prototype — data simply won't persist.
  }
}

export async function resetData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
