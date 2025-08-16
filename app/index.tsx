import { useState } from "react";
import { Button, Text, YStack } from "tamagui";

export default function CounterScreen() {
  const [count, setCount] = useState(0);

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" space="$4">
      <Text fontSize="$8" fontWeight="bold">
        Counter
      </Text>
      <Text fontSize="$6" color="$color">
        {count}
      </Text>
      <Button onPress={() => setCount(prev => prev + 1)} size="$4">
        Increment
      </Button>
      <Button onPress={() => setCount(0)} size="$4" variant="outlined">
        Reset
      </Button>
    </YStack>
  );
}
