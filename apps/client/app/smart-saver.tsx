import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const GHOST_RIDES = [
  {
    id: "1",
    time: "05:30 PM",
    from: "Business Bay",
    to: "Sharjah",
    price: 150,
    seats: 3,
  },
  {
    id: "2",
    time: "06:00 PM",
    from: "Dubai Mall",
    to: "Ajman",
    price: 180,
    seats: 2,
  },
  {
    id: "3",
    time: "06:45 PM",
    from: "JLT",
    to: "Abu Dhabi",
    price: 250,
    seats: 4,
  },
];

export default function SmartSaver() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* HEADER */}
        <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Smart Saver Rides</Text>
        </View>

        <ScrollView className="px-5 pt-4">
          <Text className="text-gray-500 mb-4">
            Available scheduled rides nearby.
          </Text>

          {GHOST_RIDES.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm active:opacity-70"
              onPress={() => {
                // Book Logic
                alert(`Booked ride for ${ride.time}`);
              }}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center">
                  <View className="bg-green-100 p-2 rounded-lg">
                    <Ionicons name="time" size={20} color="#16A34A" />
                  </View>
                  <Text className="font-bold text-lg ml-3">{ride.time}</Text>
                </View>
                <Text className="font-bold text-xl text-green-600">
                  {ride.price} AED
                </Text>
              </View>

              <View className="mt-4 pl-2 border-l-2 border-gray-200 ml-3 space-y-3">
                <View>
                  <Text className="text-xs text-gray-400">From</Text>
                  <Text className="font-bold text-black">{ride.from}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400">To</Text>
                  <Text className="font-bold text-black">{ride.to}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mt-4 border-t border-gray-50 pt-3">
                <Text className="text-gray-500 text-xs">
                  {ride.seats} seats available
                </Text>
                <View className="bg-black px-4 py-2 rounded-full">
                  <Text className="text-white text-xs font-bold">Book Now</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
