import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6">
        <Text className="text-3xl font-bold mb-6">Profile</Text>

        {/* Menu Items */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                Logout
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
