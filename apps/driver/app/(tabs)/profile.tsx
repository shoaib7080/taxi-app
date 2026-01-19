import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DriverProfile() {
  const { logout, user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center p-6">
      <View className="w-24 h-24 bg-gray-200 rounded-full mb-6 items-center justify-center">
        <Text className="text-4xl">👤</Text>
      </View>

      <Text className="text-2xl font-bold font-sans mb-1">
        {user?.fullName || "Driver"}
      </Text>
      <Text className="text-secondary font-sans mb-10">{user?.email}</Text>

      <TouchableOpacity
        onPress={logout}
        className="bg-red-50 w-full py-4 rounded-xl items-center border border-red-100"
      >
        <Text className="text-red-500 font-bold font-sans">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
