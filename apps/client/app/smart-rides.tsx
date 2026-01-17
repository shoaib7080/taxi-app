import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MOCK_RIDES = [
  {
    id: "1",
    from: "Dubai Mall",
    to: "Palm Jumeirah",
    time: "10:30 AM",
    price: "15 AED",
    seats: 2,
    driver: "Ahmed",
    rating: 4.8,
  },
  {
    id: "2",
    from: "Business Bay",
    to: "Dubai Marina",
    time: "10:45 AM",
    price: "20 AED",
    seats: 3,
    driver: "Sarah",
    rating: 4.9,
  },
  {
    id: "3",
    from: "Downtown Dubai",
    to: "JLT",
    time: "11:00 AM",
    price: "25 AED",
    seats: 1,
    driver: "Mike",
    rating: 4.7,
  },
];

export default function SmartRidesPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const city = params.city || "Dubai";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="flex-row items-center p-5 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold font-sans">Smart Saver Rides</Text>
          <Text className="text-gray-500 text-sm">
            Available rides in {city}
          </Text>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={MOCK_RIDES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListFooterComponent={() => <View className="h-20" />}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm flex-row items-center">
            {/* LEFT: TIME & LINE */}
            <View className="mr-4 items-center">
              <Text className="text-gray-800 font-bold mb-1">{item.time}</Text>
              <View className="w-[1px] h-10 bg-gray-200" />
            </View>

            {/* MIDDLE: INFO */}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name="location-outline" size={14} color="gray" />
                <Text className="text-xs text-gray-500 ml-1">{item.from}</Text>
              </View>
              <View className="flex-row items-center mb-3">
                <Ionicons name="flag-outline" size={14} color="black" />
                <Text className="text-xs text-black font-bold ml-1">
                  {item.to}
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="bg-gray-100 px-2 py-1 rounded-lg mr-2">
                  <Text className="text-xs text-secondary">
                    {item.seats} seats left
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">
                  Driver: {item.driver}
                </Text>
              </View>
            </View>

            {/* RIGHT: PRICE & ACTION */}
            <View className="items-end">
              <Text className="text-green-600 font-bold text-lg mb-2">
                {item.price}
              </Text>
              <View className="bg-black rounded-full p-2">
                <Ionicons name="chevron-forward" size={16} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
