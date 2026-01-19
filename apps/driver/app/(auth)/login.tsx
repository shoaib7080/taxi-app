import React, { useState } from "react";
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
// Make sure you copied the 'components' folder from apps/client to apps/driver!
// If not, you'll need to copy Input.tsx and Button.tsx first.
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

import { useAuth } from "../../context/AuthContext";
import { DRIVER_LOGIN_MUTATION } from "../../graphql/mutations";

export default function DriverLogin() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginApi, { loading }] = useMutation(DRIVER_LOGIN_MUTATION, {
    onCompleted: (data) => {
      // 1. Backend has already verified this is a Driver.
      // 2. Save token and redirect.
      console.log("Driver Login Success:", data.login.user);
      setAuthUser(data.login.token, data.login.user);
      router.replace("/(tabs)");
    },
    onError: (error) => {
      Alert.alert("Login Failed", error.message);
    },
  });

  const handleLogin = () => {
    if (!email || !password)
      return Alert.alert("Error", "Please fill in all fields");
    loginApi({ variables: { email, password } });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Dark Theme for Driver App looks cool/professional */}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 justify-center"
      >
        {/* HEADER */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-4">
            <Ionicons name="car" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold font-sans text-black">
            Driver Partner
          </Text>
          <Text className="text-gray-400 mt-2 font-sans text-black">
            Log in to start earning
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
            containerStyle="bg-surface border-gray-200"
            // You might need to adjust Input.tsx to support dark mode text colors
            // Or just wrap it in a View with white background for now
          />
          <Input
            icon="lock-closed-outline"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            containerStyle="bg-surface border-gray-200"
          />
        </View>

        {/* BUTTON */}
        <Button
          title={loading ? "Verifying..." : "Log In"}
          onPress={handleLogin}
          className="bg-primary" // White button on black background
          textClassName="text-black"
        />

        {/* SIGN UP LINK */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-400 font-sans">New Driver? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-primary font-bold font-sans">
              Register here
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
