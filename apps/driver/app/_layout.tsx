import { Stack } from "expo-router";
import { ApolloProvider } from "@apollo/client/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { client } from "../lib/apollo";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { SocketProvider } from "../context/SocketContext";

SplashScreen.preventAutoHideAsync();

function DriverNavigation() {
  const { isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": Outfit_400Regular,
    "Outfit-Bold": Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <SocketProvider>
          <DriverNavigation />
        </SocketProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
