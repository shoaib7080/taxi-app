import {
  useFonts,
  Outfit_400Regular,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { Stack } from "expo-router";
import { ApolloProvider } from "@apollo/client/react";
import { AuthProvider } from "../context/AuthContext";
import { client } from "../lib/apollo";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Outfit-Regular": Outfit_400Regular,
    "Outfit-Bold": Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="book-ride" />
        </Stack>
      </AuthProvider>
    </ApolloProvider>
  );
}
