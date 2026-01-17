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
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { SIGNUP_MUTATION } from "../../graphql/mutations";

export default function Signup() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [signupApi, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      setAuthUser(data.signup.token, data.signup.user);
    },
    onError: (error) => {
      Alert.alert("Signup Failed", error.message);
    },
  });

  const handleSignup = () => {
    if (!email || !password || !fullName)
      return Alert.alert("Error", "Please fill in all fields");
    signupApi({ variables: { email, password, fullName } });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 justify-center"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 left-6 z-10"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View className="items-center mb-10">
          <Text className="text-3xl font-bold font-sans text-black">
            Create Account
          </Text>
          <Text className="text-gray-500 mt-2 font-sans">
            Join us to start riding
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          <Input
            icon="mail-outline"
            placeholder="Full name"
            autoCapitalize="none"
            keyboardType="default"
            value={fullName}
            onChangeText={setFullName}
          />
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

        <Button
          title={loading ? "Creating..." : "Sign Up"}
          onPress={handleSignup}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
