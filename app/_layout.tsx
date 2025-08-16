import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { TamaguiProvider } from "tamagui";
import { config } from "@/tamagui.config";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "SpaceMono-Bold": require("../assets/fonts/SpaceMono-Regular.ttf")
  });

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: "Game" }} />
        <Tabs.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
      </Tabs>
      <StatusBar style="auto" />
    </TamaguiProvider>
  );
}
