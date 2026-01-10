import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/Input";

interface HomeHeaderProps {
  onSearchPress: () => void;
}

export const HomeHeader = ({ onSearchPress }: HomeHeaderProps) => {
  return (
    <View>
      <View className="flex-row justify-between items-center mt-2 px-1">
        <View className="flex-row items-center space-x-3">
          <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
            <Ionicons name="person" size={24} color="gray" />
          </View>
          <View>
            <Text className="text-secondary text-sm font-sans">
              Hello User,
            </Text>
            <Text className="text-primary text-2xl font-bold">
              Where to go?
            </Text>
          </View>
        </View>
        <TouchableOpacity className="bg-white p-2 rounded-full shadow-sm">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* SEARCH INPUT TRIGGER */}
      <TouchableOpacity
        className="mt-6"
        onPress={onSearchPress}
        activeOpacity={0.9}
      >
        <View pointerEvents="none">
          <Input
            icon="search"
            placeholder="Enter destination"
            editable={false}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
