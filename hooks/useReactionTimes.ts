import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { ReactionTimeStats } from "@/types";
import {
  getAllReactionTimes,
  saveReactionTime,
  clearAllReactionTimes,
  getBestTime,
  getAverageTime,
  getTop10Times,
  getLast20Attempts,
} from "@/lib/storage";

export function useReactionTimes() {
  const [stats, setStats] = useState<ReactionTimeStats>({
    bestTime: null,
    averageTime: null,
    totalGames: 0,
    top10: [],
    last20Attempts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [bestTime, averageTime, top10, last20Attempts] = await Promise.all([
        getBestTime(),
        getAverageTime(),
        getTop10Times(),
        getLast20Attempts(),
      ]);
      
      const allEntries = await getAllReactionTimes();
      
      setStats({
        bestTime,
        averageTime,
        totalGames: allEntries.length,
        top10,
        last20Attempts,
      });
    } catch {
      setError("Failed to load reaction times");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTime = useCallback(async (timeMs: number) => {
    try {
      await saveReactionTime(timeMs);
      await loadStats();
    } catch (e) {
      setError("Failed to save reaction time");
      throw e;
    }
  }, [loadStats]);

  const clearAll = useCallback(async () => {
    try {
      await clearAllReactionTimes();
      setStats({
        bestTime: null,
        averageTime: null,
        totalGames: 0,
        top10: [],
        last20Attempts: [],
      });
      setError("");
    } catch (e) {
      setError("Failed to clear reaction times");
      throw e;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return {
    stats,
    loading,
    error,
    saveTime,
    clearAll,
    refresh,
  };
}