import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@apollo/client/react";
import { GET_RIDE_STATUS } from "../graphql/mutations";

export default function RideDetails() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams();

  // Fetch final details (in case we navigated here but data is stale)
  const { data, loading, error } = useQuery(GET_RIDE_STATUS, {
    variables: { id: rideId },
    pollInterval: 5000,
    onError: (err) => console.error("RideDetails Polling Error:", err),
  });

  const ride = data?.getRide;

  if (loading && !ride) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>Ride not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <View className="flex-1 px-6 pt-10 items-center">
        {/* Success Icon */}
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6 animate-bounce">
          <Ionicons name="checkmark" size={60} color="#15803d" />
        </View>

        <Text className="text-3xl font-bold text-green-800 font-sans mb-2">
          Driver Found!
        </Text>
        <Text className="text-gray-500 font-sans text-center mb-10">
          Your ride is confirmed. Please share the OTP with the driver.
        </Text>

        {/* OTP CARD */}
        <View className="bg-white w-full p-8 rounded-3xl shadow-sm border border-green-100 items-center mb-8">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
            Ride OTP
          </Text>
          <Text className="text-5xl font-bold text-black tracking-widest">
            {ride.rideOtp}
          </Text>
        </View>

        {/* DRIVER INFO */}
        <View className="w-full bg-white p-5 rounded-2xl flex-row items-center mb-4 shadow-sm">
          <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-4">
            <Ionicons name="person" size={24} color="gray" />
          </View>
          <View>
            <Text className="font-bold text-lg">
              {ride.driver?.fullName || "Shoaib Ahmad"}
            </Text>
            <Text className="text-gray-500">Toyota Camry • ABC 1234</Text>
          </View>
          <View className="flex-1 items-end">
            <View className="bg-black px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">4.9 ★</Text>
            </View>
          </View>
        </View>

        {/* FARE INFO */}
        <View className="w-full bg-white p-5 rounded-2xl flex-row justify-between items-center shadow-sm">
          <Text className="text-gray-500 font-bold">Estimated Fare</Text>
          <Text className="text-xl font-bold">{ride.price} AED</Text>
        </View>
      </View>

      {/* FOOTER ACTIONS */}
      <View className="p-5 bg-white shadow-lg rounded-t-3xl">
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="w-full bg-gray-100 py-4 rounded-xl items-center mb-3"
        >
          <Text className="font-bold text-gray-700">Back to Map</Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-full bg-red-50 py-4 rounded-xl items-center">
          <Text className="font-bold text-red-500">Cancel Ride</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
