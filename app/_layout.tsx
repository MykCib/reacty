import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Gamepad2, Trophy } from "@tamagui/lucide-icons";

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
        <Tabs.Screen
          name="index"
          options={{
            title: "Game",
            tabBarIcon: ({ color }) => <Gamepad2 size={24} color={color} />
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Leaderboard",
            tabBarIcon: ({ color }) => <Trophy size={24} color={color} />
          }}
        />
      </Tabs>
      <StatusBar style="auto" />
    </TamaguiProvider>
  );
}
