import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReactionTimeEntry } from "@/types";

const STORAGE_PREFIX = "reaction:";
const ATTEMPTS_KEY = "reaction_attempts";

function isValidNumber(value: string | null): value is string {
  if (value == null) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

function parseKeyDate(key: string): Date | null {
  if (!key.startsWith(STORAGE_PREFIX)) return null;
  const iso = key.slice(STORAGE_PREFIX.length);
  const date = new Date(iso);
  if (isNaN(date.getTime())) return null;
  return date;
}

export async function getAllReactionTimes(): Promise<ReactionTimeEntry[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const reactionKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
    if (reactionKeys.length === 0) return [];

    const entries = await AsyncStorage.multiGet(reactionKeys);
    const parsed: ReactionTimeEntry[] = [];

    for (const [key, value] of entries) {
      const date = parseKeyDate(key);
      if (!date) continue;
      if (!isValidNumber(value)) continue;
      parsed.push({ key, date, timeMs: Number(value) });
    }

    return parsed.sort((a, b) => a.timeMs - b.timeMs);
  } catch {
    return [];
  }
}

export async function saveReactionTime(timeMs: number): Promise<void> {
  const key = `${STORAGE_PREFIX}${new Date().toISOString()}`;
  await AsyncStorage.setItem(key, String(timeMs));
  await saveLast20Attempts(timeMs);
}

export async function clearAllReactionTimes(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const reactionKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
  if (reactionKeys.length > 0) {
    await AsyncStorage.multiRemove(reactionKeys);
  }
  await clearLast20Attempts();
}

export async function getBestTime(): Promise<number | null> {
  const entries = await getAllReactionTimes();
  return entries.length > 0 ? entries[0].timeMs : null;
}

export async function getAverageTime(lastN?: number): Promise<number | null> {
  const entries = await getAllReactionTimes();
  if (entries.length === 0) return null;
  
  const times = lastN ? entries.slice(0, lastN) : entries;
  const sum = times.reduce((acc, entry) => acc + entry.timeMs, 0);
  return Math.round(sum / times.length);
}

export async function getTop10Times(): Promise<ReactionTimeEntry[]> {
  const entries = await getAllReactionTimes();
  return entries.slice(0, 10);
}

export async function saveLast20Attempts(timeMs: number): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(ATTEMPTS_KEY);
    const attempts: number[] = existing ? JSON.parse(existing) : [];
    
    attempts.unshift(timeMs);
    
    if (attempts.length > 20) {
      attempts.splice(20);
    }
    
    await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {}
}

export async function getLast20Attempts(): Promise<number[]> {
  try {
    const data = await AsyncStorage.getItem(ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function clearLast20Attempts(): Promise<void> {
  await AsyncStorage.removeItem(ATTEMPTS_KEY);
}