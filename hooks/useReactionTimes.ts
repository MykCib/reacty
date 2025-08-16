import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { ReactionTimeEntry, ReactionTimeStats } from "@/types";
import {
  getAllReactionTimes,
  saveReactionTime,
  clearAllReactionTimes,
  getBestTime,
  getAverageTime,
  getTop10Times,
} from "@/lib/storage";

export function useReactionTimes() {
  const [stats, setStats] = useState<ReactionTimeStats>({
    bestTime: null,
    averageTime: null,
    totalGames: 0,
    top10: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [bestTime, averageTime, top10] = await Promise.all([
        getBestTime(),
        getAverageTime(),
        getTop10Times(),
      ]);
      
      const allEntries = await getAllReactionTimes();
      
      setStats({
        bestTime,
        averageTime,
        totalGames: allEntries.length,
        top10,
      });
    } catch (e) {
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