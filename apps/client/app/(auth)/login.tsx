import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@apollo/client/react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import {
  LOGIN_MUTATION,
  UPDATE_PUSH_TOKEN_MUTATION,
} from "../../graphql/mutations";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export default function Login() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth(); // Rename to avoid conflict with mutation function

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pushToken, setPushToken] = useState<string | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      // Get the token (No project ID needed for dev, but recommended for prod)
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("📲 My Push Token:", token);
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setPushToken(token));
  }, []);

  const [updatePushToken] = useMutation(UPDATE_PUSH_TOKEN_MUTATION);

  // GraphQL Hook
  const [loginApi, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // 1. Success! Save token and redirect
      setAuthUser(data.login.token, data.login.user);

      // 2. Update Push Token
      if (pushToken) {
        updatePushToken({ variables: { token: pushToken } }).catch((err) =>
          console.error("Error updating push token", err),
        );
      }
    },
    onError: (error) => {
      // 2. Fail! Show error
      Alert.alert("Login Failed", error.message);
    },
  });

  const handleLogin = () => {
    if (!email || !password)
      return Alert.alert("Error", "Please fill in all fields");

    loginApi({
      variables: { email, password },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 justify-center"
      >
        {/* HEADER */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-black rounded-3xl items-center justify-center mb-4">
            <Ionicons name="car-sport" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold font-sans text-black">
            Welcome Back
          </Text>
          <Text className="text-gray-500 mt-2 font-sans">
            Enter your details to continue
          </Text>
        </View>

        {/* INPUTS */}
        <View className="space-y-4 mb-8">
          <Input
            icon="mail-outline"
            placeholder="Email Address"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            icon="lock-closed-outline"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* BUTTON */}
        <Button
          title={loading ? "Logging in..." : "Log In"}
          onPress={handleLogin}
          // You might need to update Button.tsx to accept 'disabled' prop
        />

        {/* SIGN UP LINK */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 font-sans">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-black font-bold font-sans">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
