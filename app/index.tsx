import { useState, useRef } from "react";
import { Button, Text, YStack, Stack } from "tamagui";
import { Pressable } from "react-native";

type GameState = "idle" | "waiting" | "red" | "result" | "tooEarly";

export default function ReactionGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = () => {
    setGameState("waiting");
    setReactionTime(0);

    const randomDelay = Math.random() * 5000 + 1000; // 1-6 seconds

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState("red");
    }, randomDelay);
  };

  const handlePress = () => {
    if (gameState === "waiting") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState("tooEarly");
      return;
    }

    if (gameState === "red") {
      const endTime = Date.now();
      const reaction = endTime - startTimeRef.current;
      setReactionTime(reaction);
      setGameState("result");
    }
  };

  const resetGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGameState("idle");
    setReactionTime(0);
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case "waiting":
        return "$gray8";
      case "red":
        return "$red8";
      default:
        return "$background";
    }
  };

  const getReactionMessage = () => {
    if (reactionTime < 200) return "Lightning fast! ⚡";
    if (reactionTime < 300) return "Excellent! 🎯";
    if (reactionTime < 400) return "Good! 👍";
    if (reactionTime < 500) return "Not bad! 👌";
    return "Try again! 🐌";
  };

  if (gameState === "waiting" || gameState === "red") {
    return (
      <Pressable onPress={handlePress} style={{ flex: 1 }}>
        <Stack
          flex={1}
          backgroundColor={getBackgroundColor()}
          justifyContent="center"
          alignItems="center"
        >
          {gameState === "waiting" && (
            <Text color="$color" fontSize="$6" textAlign="center">
              Wait for red...
            </Text>
          )}
          {gameState === "red" && (
            <Text color="white" fontSize="$8" fontWeight="bold" textAlign="center">
              TAP NOW!
            </Text>
          )}
        </Stack>
      </Pressable>
    );
  }

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" space="$4">
      <Text fontSize="$8" fontWeight="bold" textAlign="center">
        Reaction Game
      </Text>

      {gameState === "idle" && (
        <>
          <Text fontSize="$5" textAlign="center" color="$gray11">
            Press start, wait for red, then tap as fast as you can!
          </Text>
          <Button onPress={startGame} size="$6" fontSize="$6">
            Start Game
          </Button>
        </>
      )}

      {gameState === "result" && (
        <>
          <Text fontSize="$7" color="$green10" fontWeight="bold">
            {getReactionMessage()}
          </Text>
          <Text fontSize="$6">
            Reaction time: {reactionTime}ms
          </Text>
          <Button onPress={resetGame} size="$5">
            Play Again
          </Button>
        </>
      )}

      {gameState === "tooEarly" && (
        <>
          <Text fontSize="$7" color="$red10" fontWeight="bold">
            Too early! 😅
          </Text>
          <Text fontSize="$5" textAlign="center" color="$gray11">
            You pressed before the screen turned red
          </Text>
          <Button onPress={resetGame} size="$5">
            Try Again
          </Button>
        </>
      )}
    </YStack>
  );
}
