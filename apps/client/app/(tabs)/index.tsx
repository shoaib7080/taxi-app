import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RideTypeToggle } from "../../components/RideTypeToggle";
import { Input } from "../../components/Input";
import { ScrollView } from "react-native";

const { width, height } = Dimensions.get("window");

// DUMMY CARS (For the Pitch)
const CARS = [
  { id: 1, lat: 25.2048, lng: 55.2708, rotation: 45 }, // Near Dubai
  { id: 2, lat: 25.19, lng: 55.26, rotation: 90 },
  { id: 3, lat: 25.21, lng: 55.28, rotation: 120 },
];

const SAVER_CARS = [
  { id: 4, lat: 24.4539, lng: 54.3773, rotation: 180 }, // Near Abu Dhabi
];

// This saves you $5 per 1000 requests by not using the Directions API.
const DEMO_ROUTE = [
  { latitude: 25.2048, longitude: 55.2708 }, // Start: Dubai
  { latitude: 25.04, longitude: 55.1 }, // Jebel Ali
  { latitude: 24.86, longitude: 54.85 }, // Ghantoot
  { latitude: 24.65, longitude: 54.6 }, // Al Rahba
  { latitude: 24.4539, longitude: 54.3773 }, // End: Abu Dhabi
];

export default function Home() {
  const router = useRouter();
  const [rideMode, setRideMode] = useState<"instant" | "saver">("instant");
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [locations, setLocations] = useState({
    from: "Dubai (DXB)",
    fromDesc: "Downtown Dubai",
    to: "Abu Dhabi (AUH)",
    toDesc: "Yas Island",
  });

  const mapRef = useRef<MapView>(null);

  // 3. CAMERA ANIMATION LOGIC
  // Remove auto-panning on ride mode change as requested
  // We strictly use this for initial setup or manual resets if needed

  const handleSwap = () => {
    setLocations((prev) => ({
      from: prev.to,
      fromDesc: prev.toDesc,
      to: prev.from,
      toDesc: prev.fromDesc,
    }));
  };

  const handleConfirmLocation = () => {
    setIsSelectingLocation(false);
    // Logic to actually set location based on crosshair would go here
  };

  return (
    <View className="flex-1 bg-white">
      {/* --- LAYER 1: THE MAP (Background) --- */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 25.2048,
          longitude: 55.2708,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        customMapStyle={[
          {
            featureType: "poi",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ]}
      >
        {/* Render Cars */}
        {(rideMode === "instant" ? CARS : SAVER_CARS).map((car) => (
          <Marker
            key={car.id}
            coordinate={{ latitude: car.lat, longitude: car.lng }}
            rotation={car.rotation}
          >
            <View className="bg-white p-2 rounded-full shadow-md border border-gray-100">
              <Ionicons
                name="car-sport"
                size={20}
                color={rideMode === "saver" ? "#16A34A" : "black"}
              />
            </View>
          </Marker>
        ))}

        {/* Render the Route Line only when NOT selecting (cleaner look) */}
        {!isSelectingLocation && (
          <Polyline
            coordinates={DEMO_ROUTE}
            strokeColor={rideMode === "saver" ? "#16A34A" : "#000000"} // Green for Saver, Black for Normal
            strokeWidth={4}
            lineDashPattern={rideMode === "saver" ? [10, 10] : undefined} // Dashed line for return trips
          />
        )}
      </MapView>

      {/* Map Overlay for Transparency Effect (Only in Normal Mode) */}
      {!isSelectingLocation && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 pointer-events-none"
          pointerEvents="none"
        />
      )}

      {/* --- LAYER 2: UI --- */}
      <SafeAreaView className="flex-1" pointerEvents="box-none">
        {/* SELECTION MODE UI */}
        {isSelectingLocation ? (
          <View className="flex-1 justify-between pb-10 px-5">
            <View className="mt-2 bg-white p-4 rounded-2xl shadow-sm flex-row items-center border border-gray-100">
              <TouchableOpacity onPress={() => setIsSelectingLocation(false)}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text className="ml-4 font-bold text-lg font-sans">
                Select Location
              </Text>
            </View>

            {/* Center Crosshair (Visual only for now) */}
            <View className="absolute top-[50%] left-[50%] -ml-4 -mt-10 items-center justify-center pointer-events-none">
              <Ionicons name="location-sharp" size={40} color="#171ACB" />
            </View>

            <TouchableOpacity
              onPress={handleConfirmLocation}
              className="bg-black py-4 rounded-2xl items-center shadow-lg"
            >
              <Text className="text-white text-lg font-bold font-sans">
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* NORMAL MODE UI */
          <ScrollView
            className="px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* HEADER */}
            <View className="flex-row justify-between items-center mt-2">
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
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT - Triggers Selection Mode */}
            <TouchableOpacity
              className="mt-6"
              onPress={() => setIsSelectingLocation(true)}
              activeOpacity={0.9}
            >
              {/* Using pointerEvents="none" to make the Input purely visual within the touchable */}
              <View pointerEvents="none">
                <Input
                  icon="search"
                  placeholder="Enter destination"
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            {/* TRANSPORT TABS */}
            <View className="flex-row justify-between mt-6">
              {["Car", "Taxi", "Bus", "Bike"].map((item, index) => {
                const isActive = index === 0; // Highlight 'Car'
                return (
                  <TouchableOpacity
                    key={item}
                    className={`items-center justify-center w-[22%] h-24 rounded-2xl ${
                      isActive
                        ? "bg-primary shadow-lg shadow-blue-900/20"
                        : "bg-white"
                    }`}
                  >
                    <Ionicons
                      name={
                        item === "Car"
                          ? "car"
                          : item === "Taxi"
                          ? "car-sport"
                          : item === "Bus"
                          ? "bus"
                          : "bicycle"
                      }
                      size={28}
                      color={isActive ? "white" : "black"}
                    />
                    <Text
                      className={`mt-2 font-sans ${
                        isActive ? "text-white font-bold" : "text-black"
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <RideTypeToggle mode={rideMode} setMode={setRideMode} />

            {/* LOCATION WIDGET (From -> To) */}
            <View
              className={`rounded-3xl p-5 shadow-sm border border-gray-100 transition-all ${
                rideMode === "saver"
                  ? "bg-green-50 border-green-200"
                  : "bg-white"
              }`}
            >
              {/* FROM */}
              <View className="border-b border-gray-100 pb-4">
                <Text className="text-gray-400 text-xs font-sans mb-1">
                  From
                </Text>
                <Text className="text-xl font-bold text-black">
                  {locations.from}
                </Text>
                <Text className="text-gray-500 text-sm font-sans">
                  {locations.fromDesc}
                </Text>
              </View>

              {/* SWAP ICON */}
              <TouchableOpacity
                onPress={handleSwap}
                className="absolute right-8 top-[42%] bg-white p-2 rounded-full shadow-md z-10 border border-gray-50"
              >
                <Ionicons name="swap-vertical" size={20} color="#171ACB" />
              </TouchableOpacity>

              {/* TO */}
              <View className="pt-4">
                <Text className="text-gray-400 text-xs font-sans mb-1">To</Text>
                <Text className="text-xl font-bold text-black">
                  {locations.to}
                </Text>
                <Text className="text-gray-500 text-sm font-sans">
                  {locations.toDesc}
                </Text>
              </View>
            </View>

            {/* PRICE PREVIEW (The Pitch Hook) */}
            <View className="mt-6 bg-white p-4 rounded-2xl flex-row justify-between items-center border border-gray-100">
              <Text className="text-gray-500 font-sans">Estimated Fare</Text>
              <View className="items-end">
                {rideMode === "saver" && (
                  <Text className="text-gray-400 line-through text-sm">
                    400 AED
                  </Text>
                )}
                <Text
                  className={`text-xl font-bold ${
                    rideMode === "saver" ? "text-green-600" : "text-black"
                  }`}
                >
                  {rideMode === "saver" ? "200 AED" : "400 AED"}
                </Text>
              </View>
            </View>

            {/* DATE & PASSENGERS */}
            <View className="flex-row mt-4 justify-between">
              <TouchableOpacity className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-sans">
                  Departing on
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="calendar-outline" size={18} color="black" />
                  <Text className="ml-2 font-bold font-sans">Today</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-sans">
                  Passengers
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="person-outline" size={18} color="black" />
                  <Text className="ml-2 font-bold font-sans">1 Passenger</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* SEARCH BUTTON */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/book-ride",
                  params: { mode: rideMode },
                })
              }
              className="mt-6 bg-black rounded-2xl py-4 items-center shadow-lg active:opacity-90"
            >
              <Text className="text-white text-lg font-bold font-sans">
                Search Rides
              </Text>
            </TouchableOpacity>

            {/* PADDING FOR BOTTOM TAB BAR */}
            <View className="h-24" />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
