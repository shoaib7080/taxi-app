import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export const HomeHeader = () => {
  return (
    <View className="mb-4 mt-2">
      {/* TOP ROW: Avatar + Balance + Notification */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center overflow-hidden border border-gray-200">
            <Ionicons name="person" size={24} color="#3b82f6" />
          </View>

          {/* Balance Info */}
          <View className="ml-3">
            <Text className="text-black font-bold text-lg">100.00$</Text>
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={12} color="gray" />
              <Text className="text-gray-500 text-xs ml-1 font-medium">
                Top up credit
              </Text>
            </View>
          </View>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-white relative">
          <Ionicons name="notifications-outline" size={24} color="black" />
          <View className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM ROW: Greeting */}
      <View className="mt-8 mb-2">
        <Text className="text-black text-xl font-bold font-sans">
          Hello Muhammad,
        </Text>
        <Text className="text-blue-600 text-2xl font-bold font-sans">
          Where to go?
        </Text>
      </View>
    </View>
  );
};
