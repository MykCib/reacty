import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Stack, Text, XStack, YStack } from "tamagui";

type GameState = "idle" | "waiting" | "red" | "result" | "tooEarly";

export default function ReactionGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBestTime = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const reactionKeys = keys.filter((k) => k.startsWith("reaction:"));
      if (reactionKeys.length === 0) return;

      const entries = await AsyncStorage.multiGet(reactionKeys);
      let best = Infinity;

      for (const [, value] of entries) {
        if (value) {
          const time = Number(value);
          if (Number.isFinite(time) && time > 0 && time < best) {
            best = time;
          }
        }
      }

      if (best !== Infinity) {
        setBestTime(best);
      }
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBestTime();
    }, [loadBestTime])
  );

  const startGame = (): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setReactionTime(0);
    setGameState("waiting");

    const delayMs = Math.floor(700 + Math.random() * 4300);

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState("red");
    }, delayMs);
  };

  const handleGamePress = async (): Promise<void> => {
    if (gameState === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState("tooEarly");
      return;
    }

    if (gameState === "red") {
      const rt = Date.now() - startTimeRef.current;
      setReactionTime(rt);
      setGameState("result");
      try {
        const key = `reaction:${new Date().toISOString()}`;
        await AsyncStorage.setItem(key, String(rt));
        setBestTime((prev) => (prev == null || rt < prev ? rt : prev));
      } catch {}
    }
  };

  const reset = (): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setReactionTime(0);
    setGameState("idle");
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const bgColor = (() => {
    if (gameState === "waiting") return "$gray7";
    if (gameState === "red") return "$red10";
    return "$background";
  })();

  const feedback = (() => {
    if (reactionTime < 200) return "Lightning fast ⚡";
    if (reactionTime < 300) return "Excellent 🎯";
    if (reactionTime < 400) return "Good 👍";
    if (reactionTime < 500) return "Not bad 👌";
    return "Keep practicing 🐢";
  })();

  if (gameState === "waiting" || gameState === "red") {
    return (
      <Pressable onPress={handleGamePress} style={{ flex: 1 }}>
        <YStack
          f={1}
          jc="center"
          ai="center"
          bg={bgColor}
          animation="quick"
          enterStyle={{ opacity: 0 }}
        >
          <Stack
            p="$4"
            br="$8"
            bg="rgba(0,0,0,0.15)"
            animation="quick"
            enterStyle={{ opacity: 0, scale: 0.98, y: 5 }}
          >
            {gameState === "waiting" ? (
              <YStack ai="center" space="$2">
                <Text color="$color" fontSize="$6">
                  Get ready
                </Text>
                <Text color="$gray12" fontSize="$3">
                  Wait for red, then tap anywhere
                </Text>
              </YStack>
            ) : (
              <YStack ai="center" space="$2">
                <Text color="white" fontSize="$9" fontWeight="800">
                  TAP NOW
                </Text>
                <Text color="$gray2" fontSize="$4">
                  Tap anywhere on the screen
                </Text>
              </YStack>
            )}
          </Stack>
        </YStack>
      </Pressable>
    );
  }

  return (
    <YStack f={1} bg="$background" p="$6" space="$6" jc="center" ai="center">
      <YStack ai="center" space="$2">
        <Text fontSize="$8" fontWeight="800" letterSpacing={0.5}>
          Reaction Game
        </Text>
        <Text color="$gray11" fontSize="$4">
          Tap when the screen turns red
        </Text>
      </YStack>

      <YStack
        w="100%"
        maw={480}
        miw={280}
        bg="$gray3"
        br="$8"
        p="$6"
        space="$5"
        animation="quick"
        enterStyle={{ opacity: 0, scale: 0.98, y: 6 }}
      >
        {gameState === "idle" && (
          <YStack space="$4" ai="center">
            <Text color="$gray12" fontSize="$5">
              Press Start to begin
            </Text>

            <XStack space="$4">
              <Button size="$6" onPress={startGame}>
                Start
              </Button>
              {bestTime != null && (
                <Stack
                  bg="$gray5"
                  br="$6"
                  px="$3"
                  jc="center"
                  ai="center"
                  animation="quick"
                  enterStyle={{ opacity: 0, y: 4 }}
                >
                  <Text fontSize="$3" color="$gray12">
                    Best: {bestTime}ms
                  </Text>
                </Stack>
              )}
            </XStack>
          </YStack>
        )}

        {gameState === "result" && (
          <YStack space="$5" ai="center">
            <YStack ai="center" space="$2">
              <Text fontSize="$7" fontWeight="700" color="$green10">
                {feedback}
              </Text>
              <Text fontSize="$9" fontWeight="800">
                {reactionTime}ms
              </Text>
            </YStack>

            <XStack space="$3">
              <Button size="$5" onPress={startGame}>
                Play again
              </Button>
              <Button size="$5" variant="outlined" onPress={reset}>
                Reset
              </Button>
            </XStack>

            {bestTime != null && (
              <Text color="$gray11" fontSize="$4">
                Best so far: {bestTime}ms
              </Text>
            )}
          </YStack>
        )}

        {gameState === "tooEarly" && (
          <YStack space="$5" ai="center">
            <YStack ai="center" space="$2">
              <Text fontSize="$7" fontWeight="700" color="$red10">
                Too early
              </Text>
              <Text fontSize="$4" color="$gray12">
                Wait for the screen to turn red
              </Text>
            </YStack>

            <XStack space="$3">
              <Button size="$5" onPress={startGame}>
                Try again
              </Button>
              <Button size="$5" variant="outlined" onPress={reset}>
                Back
              </Button>
            </XStack>
          </YStack>
        )}
      </YStack>

      <Text color="$gray10" fontSize="$3">
        Tips: Stay focused. Don’t anticipate. React.
      </Text>
    </YStack>
  );
}
