import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function OTP() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleInput = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text.length === 1 && index < 3) {
      inputs.current[index + 1]?.focus();
    }
    // Handle Backspace
    if (text.length === 0 && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    // Auto-submit if full
    if (index === 3 && text.length === 1) {
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-4 w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View className="mt-10 mb-8">
        <Text className="text-3xl font-bold font-sans text-black">
          Verification
        </Text>
        <Text className="text-gray-500 mt-2 font-sans">
          We sent a code to{" "}
          <Text className="text-black font-bold">+971 50 *** 89</Text>
        </Text>
      </View>

      {/* OTP INPUTS */}
      <View className="flex-row justify-between mb-10">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            className={`w-[20%] h-16 border-2 rounded-2xl text-center text-2xl font-bold font-sans ${
              digit
                ? "border-primary bg-blue-50 text-primary"
                : "border-gray-200 bg-gray-50 text-black"
            }`}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleInput(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity>
        <Text className="text-center font-bold text-primary mb-10">
          Resend Code in 20s
        </Text>
      </TouchableOpacity>

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)")}
        className="w-full bg-primary py-4 rounded-2xl items-center shadow-lg shadow-blue-900/20"
      >
        <Text className="text-white text-lg font-bold font-sans">Verify</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
