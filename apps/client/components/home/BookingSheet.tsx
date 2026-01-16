import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RideTypeToggle } from "../RideTypeToggle";
import { Input } from "../Input";

interface BookingSheetProps {
  rideMode: "instant" | "saver";
  setRideMode: (mode: "instant" | "saver") => void;
  onSearchPress: () => void;
  onConfirmPress: () => void;
}

export const BookingSheet = ({
  rideMode,
  setRideMode,
  onSearchPress,
  onConfirmPress,
}: BookingSheetProps) => {
  return (
    <View className="bg-white rounded-t-[35px] shadow-2xl pt-6 pb-10 px-5 absolute bottom-0 left-0 right-0 h-[45%]">
      {/* 1. Fake Search Bar (Trigger) */}
      <TouchableOpacity onPress={onSearchPress} className="mb-6">
        <Input
          icon="search"
          placeholder="Enter destination"
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {/* 2. Toggle */}
      <RideTypeToggle mode={rideMode} setMode={setRideMode} />

      {/* 3. Logic/Price Widget */}
      <View
        className={`rounded-3xl p-5 border mt-4 transition-all ${
          rideMode === "saver"
            ? "bg-green-50 border-green-200"
            : "bg-gray-50 border-gray-100"
        }`}
      >
        {rideMode === "saver" && (
          <View className="bg-green-500 self-start px-3 py-1 rounded-full mb-3 flex-row items-center">
            <Ionicons name="flash" color="white" size={12} />
            <Text className="text-white text-xs font-bold ml-1">
              Live Return Deal
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 text-xs uppercase font-sans">
              Est. Fare
            </Text>
            <Text
              className={`text-2xl font-bold ${
                rideMode === "saver" ? "text-green-600" : "text-black"
              }`}
            >
              {rideMode === "saver" ? "200 AED" : "400 AED"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onConfirmPress}
            className={`px-8 py-4 rounded-2xl shadow-lg ${
              rideMode === "saver" ? "bg-green-600" : "bg-black"
            }`}
          >
            <Text className="text-white font-bold font-sans">
              {rideMode === "saver" ? "Book Slot" : "Book Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
