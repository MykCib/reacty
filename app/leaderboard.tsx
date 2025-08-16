import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  Button,
  ScrollView,
  Separator,
  Stack,
  Text,
  XStack,
  YStack,
} from "tamagui";

type LeaderboardEntry = {
  key: string;
  timeMs: number;
  date: Date;
};

const STORAGE_PREFIX = "reaction:";

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

async function fetchEntries(): Promise<LeaderboardEntry[]> {
  const keys = await AsyncStorage.getAllKeys();
  const reactionKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
  if (reactionKeys.length === 0) return [];

  const entries = await AsyncStorage.multiGet(reactionKeys);
  const parsed: LeaderboardEntry[] = [];

  for (const [key, value] of entries) {
    const date = parseKeyDate(key);
    if (!date) continue;
    if (!isValidNumber(value)) continue;
    parsed.push({ key, date, timeMs: Number(value) });
  }

  parsed.sort((a, b) => a.timeMs - b.timeMs);
  return parsed.slice(0, 10);
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const top = await fetchEntries();
      setEntries(top);
    } catch (e) {
      setErrorMessage("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!loading && entries.length > 10) {
      setEntries(entries.slice(0, 10));
    }
  }, [loading, entries]);

  const clearAll = async (): Promise<void> => {
    setErrorMessage("");
    try {
      const keys = await AsyncStorage.getAllKeys();
      const reactionKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
      if (reactionKeys.length > 0) {
        await AsyncStorage.multiRemove(reactionKeys);
      }
      setEntries([]);
    } catch {
      setErrorMessage("Failed to clear leaderboard");
    }
  };

  return (
    <ScrollView>
      <YStack f={1} p="$6" space="$6" bg="$background">
        <YStack ai="center" space="$2" mt="$6">
          <Text fontSize="$8" fontWeight="800" letterSpacing={0.5}>
            Leaderboard
          </Text>
          <Text color="$gray11" fontSize="$4">
            Top 10 fastest reaction times
          </Text>
        </YStack>

        <YStack
          w="100%"
          maw={520}
          miw={280}
          alignSelf="center"
          bg="$gray3"
          br="$8"
          p="$4"
          space="$4"
          animation="quick"
          enterStyle={{ opacity: 0, scale: 0.98, y: 6 }}
        >
          <XStack jc="space-between" ai="center">
            <XStack space="$2" ai="center">
              <Text fontSize="$5" fontWeight="700">
                Results
              </Text>
              <Text fontSize="$3" color="$gray11">
                {`(${entries.length})`}
              </Text>
            </XStack>

            <Button
              size="$3"
              onPress={clearAll}
              disabled={entries.length === 0}
            >
              Clear
            </Button>
          </XStack>

          {errorMessage ? (
            <Stack bg="$red4" br="$6" p="$3">
              <Text color="$red11">{errorMessage}</Text>
            </Stack>
          ) : null}

          {entries.length === 0 && !loading ? (
            <YStack ai="center" py="$6" space="$2">
              <Text fontSize="$5" color="$gray12">
                No results yet
              </Text>
              <Text fontSize="$3" color="$gray11">
                Play a round to record your time
              </Text>
            </YStack>
          ) : (
            <YStack>
              {entries.map((e, idx) => (
                <YStack key={e.key}>
                  <YStack py="$3" px="$2" ai="flex-start" jc="space-between">
                    <XStack ai="center" space="$3">
                      <Stack
                        w={28}
                        h={28}
                        br="$10"
                        bg="$gray6"
                        jc="center"
                        ai="center"
                      >
                        <Text fontSize="$3" color="$gray12">
                          {idx + 1}
                        </Text>
                      </Stack>
                      <Text fontSize="$6" fontWeight="700">
                        {e.timeMs}ms
                      </Text>
                    </XStack>
                    <Text color="$gray11" fontSize="$3">
                      {e.date.toLocaleString()}
                    </Text>
                  </YStack>
                  {idx < entries.length - 1 ? <Separator /> : null}
                </YStack>
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
