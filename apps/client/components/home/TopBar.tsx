import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const TopBar = () => {
  return (
    <View className="flex-row justify-between items-center mt-2 px-5 pointer-events-auto">
      <View className="flex-row items-center space-x-3 bg-white/90 p-2 pr-4 rounded-full shadow-sm backdrop-blur-md">
        <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
          <Ionicons name="person" size={24} color="gray" />
        </View>
        <View>
          <Text className="text-secondary text-sm font-sans">Hello User,</Text>
          <Text className="text-primary text-xl font-bold">Where to?</Text>
        </View>
      </View>
      <TouchableOpacity className="bg-white/90 p-3 rounded-full shadow-sm">
        <Ionicons name="notifications-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};
