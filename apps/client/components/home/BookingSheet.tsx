import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RideTypeToggle } from "../../components/RideTypeToggle";

// Mock Vehicles
const VEHICLES = [
  { id: "standard", name: "Standard", multiplier: 1, image: "car-sport" },
  { id: "premium", name: "Premium", multiplier: 1.4, image: "star" },
  { id: "xl", name: "XL", multiplier: 1.8, image: "bus" },
];

interface BookingSheetProps {
  rideMode: "instant" | "saver";
  setRideMode: (mode: "instant" | "saver") => void;
  destination: any;
  currentCity: string;
  userLocation: any;
  tripDetails: { distance: string; duration: string } | null;
  selectedVehicle: string;
  setSelectedVehicle: (id: string) => void;
  onSearchPress: () => void;
  onBookPress: () => void;
}

export const BookingSheet = ({
  rideMode,
  setRideMode,
  destination,
  currentCity,
  userLocation,
  tripDetails,
  selectedVehicle,
  setSelectedVehicle,
  onSearchPress,
  onBookPress,
}: BookingSheetProps) => {
  // Logic
  const calculateFare = (
    distanceText: string | undefined,
    vehicleMultiplier: number
  ) => {
    if (!distanceText) return 0;
    const distanceVal = parseFloat(distanceText.replace(/[^0-9.]/g, ""));
    if (isNaN(distanceVal)) return 0;
    const baseFare = 10;
    const isSaver = rideMode === "saver";
    const rate = isSaver ? 2.5 : 4.0;
    let fare = Math.round(baseFare + distanceVal * rate * vehicleMultiplier);
    return fare > 0 ? fare : 15;
  };

  return (
    <>
      <View className={destination ? "mt-2" : "mt-6"}>
        <RideTypeToggle mode={rideMode} setMode={setRideMode} />
      </View>

      {/* LOCATION WIDGET */}
      <View
        className={`rounded-3xl p-5 shadow-sm border border-gray-100 transition-all ${
          rideMode === "saver" ? "bg-green-50 border-green-200" : "bg-white"
        }`}
      >
        <View className="border-b border-gray-100 pb-4">
          <Text className="text-gray-400 text-xs font-sans mb-1">From</Text>
          <Text className="text-xl font-bold text-black" numberOfLines={1}>
            {currentCity}
          </Text>
          <Text className="text-gray-500 text-sm font-sans" numberOfLines={1}>
            {userLocation ? "Your Location" : "Waiting for GPS..."}
          </Text>
        </View>

        {/* DISTANCE BADGE */}
        {tripDetails && destination && (
          <View className="absolute left-[45%] top-[52%] bg-white px-2 py-1 rounded-full border border-gray-200 z-20 shadow-sm">
            <Text className="text-xs font-bold text-gray-500">
              {tripDetails.distance}
            </Text>
          </View>
        )}

        <TouchableOpacity className="absolute right-8 top-[42%] bg-white p-2 rounded-full shadow-md z-10 border border-gray-50">
          <Ionicons name="swap-vertical" size={20} color="#171ACB" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onSearchPress} className="pt-4">
          <Text className="text-gray-400 text-xs font-sans mb-1">To</Text>
          <Text
            className={`text-xl font-bold ${
              destination ? "text-black" : "text-gray-400"
            }`}
            numberOfLines={1}
          >
            {destination ? destination.name : "Select destination"}
          </Text>
          <Text className="text-gray-500 text-sm font-sans" numberOfLines={1}>
            {destination ? destination.desc : "Tap to search"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* VEHICLE SELECTION */}
      {destination && (
        <View className="mt-6">
          <Text className="text-gray-500 font-bold mb-3 font-sans">
            Select Vehicle
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {VEHICLES.map((vehicle) => {
              const fare = calculateFare(
                tripDetails?.distance,
                vehicle.multiplier
              );
              const isSelected = selectedVehicle === vehicle.id;

              return (
                <TouchableOpacity
                  key={vehicle.id}
                  onPress={() => setSelectedVehicle(vehicle.id)}
                  className="mr-4 w-32 p-4 rounded-3xl border flex-col items-center justify-center border-gray-100 bg-white"
                  style={[
                    isSelected
                      ? {
                          backgroundColor: "black",
                          borderColor: "black",
                        }
                      : {},
                  ]}
                >
                  <View
                    className={`p-3 rounded-full mb-2 ${
                      isSelected ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name={vehicle.image as any}
                      size={28}
                      color={isSelected ? "white" : "black"}
                    />
                  </View>
                  <Text
                    className={`text-base font-bold mb-1 ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {vehicle.name}
                  </Text>
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? "text-green-400" : "text-black"
                    }`}
                  >
                    {fare} AED
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      isSelected ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    {tripDetails?.duration || "10 min"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* BOOK BUTTON */}
      <TouchableOpacity
        onPress={onBookPress}
        className={`mt-6 rounded-2xl py-4 items-center shadow-lg active:opacity-90 ${
          rideMode === "saver" ? "bg-green-600" : "bg-black"
        }`}
      >
        <Text className="text-white text-lg font-bold font-sans">
          {destination
            ? `Book ${
                VEHICLES.find((v) => v.id === selectedVehicle)?.name || "Ride"
              }`
            : "Search Rides"}
        </Text>
      </TouchableOpacity>

      <View className="h-48" />
    </>
  );
};

// Export logic helper if needed in parent (for navigation params)
export const calculateFareHelper = (
  distanceText: string | undefined,
  rideMode: "instant" | "saver",
  vehicleId: string
) => {
  // Small duplication for cleanliness, or we could export pure function from utility
  const vehicle = VEHICLES.find((v) => v.id === vehicleId);
  if (!distanceText || !vehicle) return 0;

  const distanceVal = parseFloat(distanceText.replace(/[^0-9.]/g, ""));
  const baseFare = 10;
  const rate = rideMode === "saver" ? 2.5 : 4.0;
  let fare = Math.round(baseFare + distanceVal * rate * vehicle.multiplier);
  return fare > 0 ? fare : 15;
};
