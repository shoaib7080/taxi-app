import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

import { BookingSheet } from "@/components/home/BookingSheet";
import { saveLocation, getLastLocation } from "../../services/storage";
import { reverseGeocode } from "../../services/google";

export default function Home() {
  const router = useRouter();

  const [rideMode, setRideMode] = useState<"instant" | "saver">("instant");
  const [userLocation, setUserLocation] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState("Current Location");

  // States that are technically unused on this screen but required by BookingSheet props
  // We can pass dummy functions or simple state for these as the actions will navigate away
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("standard");

  // 1. 🟢 GET REAL USER LOCATION for display
  useEffect(() => {
    (async () => {
      const cached = await getLastLocation();
      if (cached) {
        setUserLocation(cached);
        if (cached.city) setCurrentCity(cached.city);
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setUserLocation(newLoc);

      const address = await reverseGeocode(newLoc.latitude, newLoc.longitude);
      const city = address.city || "Unknown City";
      setCurrentCity(city);
      await saveLocation({ ...newLoc, city });
    })();
  }, []);

  return (
    <LinearGradient
      colors={["#b4d3fdff", "#ffffff"]} // blue-100 to white
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.5 }} // Gradient fades out halfway or earlier
    >
      <SafeAreaView className="flex-1 bg-transparent">
        <GestureHandlerRootView className="flex-1">
          {/* Booking Sheet usage as the primary UI */}
          <BookingSheet
            isSelecting={isSelecting}
            setIsSelecting={setIsSelecting}
            destination={null} // No destination in Home
            rideMode={rideMode}
            setRideMode={setRideMode}
            userLocation={userLocation}
            currentCity={currentCity}
            tripDetails={null}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            onSearchPress={() => router.push("/map-search")}
          />
        </GestureHandlerRootView>
      </SafeAreaView>
    </LinearGradient>
  );
}
