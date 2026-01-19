import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  // 1. If still checking SecureStore, show nothing (Splash screen handles this mainly)
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // 2. If User exists -> Go to Dashboard
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // 3. If No User -> Go to Login
  return <Redirect href="/(auth)/login" />;
}
