import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function BookRide() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isSaver = params.mode === "saver";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-5">
        {/* CUSTOM HEADER */}
        <View className="flex-row items-center mt-2 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4 font-sans text-black">
            Book a Ride
          </Text>
        </View>

        {/* TRIP SUMMARY WIDGET */}
        <View
          className={`rounded-3xl p-5 shadow-sm border ${
            isSaver
              ? "bg-green-50 border-green-200"
              : "bg-white border-gray-100"
          }`}
        >
          {/* Pick Up */}
          <View className="flex-row items-center mb-6">
            <View className="mr-4 items-center">
              <Ionicons
                name="navigate-circle-outline"
                size={24}
                color="black"
              />
              {/* Dotted Line */}
              <View className="h-8 w-[1px] bg-gray-300 my-1" />
            </View>
            <View className="flex-1 border-b border-gray-100 pb-4">
              <Text className="text-gray-400 text-xs font-sans">Pick up</Text>
              <Text className="text-lg font-bold text-black mt-1">
                San Isidro, QC
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View className="flex-row items-center">
            <View className="mr-4">
              <Ionicons name="location-outline" size={24} color="black" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs font-sans">
                Destination
              </Text>
              <Text className="text-lg font-bold text-black mt-1">
                Sunny San Isidro
              </Text>
            </View>
          </View>

          {/* Price Summary Section */}
          <View className="mt-8 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">
                {params.vehicle
                  ? `${params.vehicle.toString().toUpperCase()} Fare`
                  : "Base Fare"}
              </Text>
              <Text className="font-bold">
                {params.price ? `${params.price} AED` : "400 AED"}
              </Text>
            </View>

            {isSaver && !params.price && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-green-600 font-bold">
                  Smart Return Discount
                </Text>
                <Text className="text-green-600 font-bold">-200 AED</Text>
              </View>
            )}

            <View className="h-[1px] bg-gray-100 my-2" />

            <View className="flex-row justify-between">
              <Text className="text-xl font-bold">Total</Text>
              <Text className="text-xl font-bold text-primary">
                {params.price
                  ? `${params.price} AED`
                  : isSaver
                  ? "200 AED"
                  : "400 AED"}
              </Text>
            </View>
          </View>

          {/* Map/Route Icon (Visual Flair) */}
          <View className="absolute right-5 top-[40%]">
            <Ionicons name="infinite-outline" size={24} color="gray" />
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <Text className="text-lg font-bold font-sans mt-8 mb-4">
          Preferences
        </Text>

        <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          {/* Passenger Name */}
          <View>
            <Text className="text-black font-bold mb-2">Passenger name</Text>
            <TextInput
              value="Muhammad"
              className="bg-background p-4 rounded-xl text-black font-sans"
            />
          </View>

          {/* Gender Dropdown (Mock) */}
          <View className="mt-2">
            <Text className="text-black font-bold mb-2">Gender</Text>
            <View className="bg-background p-4 rounded-xl flex-row justify-between items-center">
              <Text className="text-black font-sans">Male</Text>
              <Ionicons name="chevron-down" size={20} color="gray" />
            </View>
          </View>
        </View>

        {/* BOTTOM ACTIONS */}
        <View className="mt-8 space-y-4">
          <TouchableOpacity
            onPress={() => router.push("/driver-details")}
            className={`${
              isSaver ? "bg-green-600" : "bg-primary"
            } py-4 rounded-2xl items-center shadow-lg`}
          >
            <Text className="text-white text-lg font-bold font-sans">
              Book Ride
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white py-4 rounded-2xl items-center border border-gray-200">
            <Text className="text-black text-lg font-bold font-sans">
              Schedule ride
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
