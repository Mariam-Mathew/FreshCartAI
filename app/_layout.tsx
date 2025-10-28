// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <Stack>
      <SafeAreaView>
        <Stack.Screen name=" " options={{ headerShown: false }} />
        {/* Changed from (tabs) */}
        <Stack.Screen
          name="recipe/[id]"
          options={{
            title: "Recipe",
            presentation: "modal",
          }}
        />
      </SafeAreaView>
    </Stack>
  );
}
