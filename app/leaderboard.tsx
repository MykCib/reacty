import { Button, ScrollView, Separator, Stack, Text, XStack, YStack } from "tamagui";
import { useReactionTimes } from "@/hooks/useReactionTimes";

export default function Leaderboard() {
  const { stats, loading, error, clearAll } = useReactionTimes();

  const handleClearAll = async (): Promise<void> => {
    try {
      await clearAll();
    } catch {}
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
                {loading ? "(loading...)" : `(${stats.top10.length})`}
              </Text>
            </XStack>

            <Button
              size="$3"
              onPress={handleClearAll}
              disabled={stats.top10.length === 0}
            >
              Clear
            </Button>
          </XStack>

          {error ? (
            <Stack bg="$red4" br="$6" p="$3">
              <Text color="$red11">{error}</Text>
            </Stack>
          ) : null}

          {stats.totalGames > 0 && (
            <XStack jc="space-between" ai="center" p="$2" bg="$gray4" br="$6">
              <Text fontSize="$3" color="$gray12">
                Total games: {stats.totalGames}
              </Text>
              {stats.averageTime && (
                <Text fontSize="$3" color="$gray12">
                  Average: {stats.averageTime}ms
                </Text>
              )}
            </XStack>
          )}

          {stats.top10.length === 0 && !loading ? (
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
              {stats.top10.map((entry, idx) => (
                <YStack key={entry.key}>
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
                        {entry.timeMs}ms
                      </Text>
                    </XStack>
                    <Text color="$gray11" fontSize="$3">
                      {entry.date.toLocaleString()}
                    </Text>
                  </YStack>
                  {idx < stats.top10.length - 1 ? <Separator /> : null}
                </YStack>
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}