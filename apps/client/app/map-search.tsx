import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TextInput,
  FlatList,
  BackHandler,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  searchPlaces,
  fetchDirections,
  fetchPlaceDetails,
  reverseGeocode,
} from "../services/google";
import { saveLocation, getLastLocation } from "../services/storage";
import { HomeMap } from "@/components/home/HomeMap";
import { BookingSheet } from "@/components/home/BookingSheet";

export default function MapSearchPage() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [rideMode, setRideMode] = useState<"instant" | "saver">("instant");
  const [userLocation, setUserLocation] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState("Current Location");
  const [destination, setDestination] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);

  // No longer using isSelecting for modal overlay.
  // Maybe calculate "isSearching" based on text length or focus?
  // Let's just keep track if we are interacting with search.

  // Trip Info
  const [tripDetails, setTripDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  // Search State
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("standard");

  // --- BACK HANDLER ---
  useEffect(() => {
    const onBackPress = () => {
      // If destination selected, clear it
      if (destination) {
        setDestination(null);
        setRouteCoords([]);
        return true;
      }
      // If search has text but no destination, clear search?
      if (searchText.length > 0) {
        setSearchText("");
        setSearchResults([]);
        Keyboard.dismiss();
        return true;
      }

      router.back();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [destination, searchText]);

  // 1. 🟢 GET REAL USER LOCATION
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

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }
    const results = await searchPlaces(text);
    setSearchResults(results);
  };

  const handleSelectPlace = async (
    placeId: string,
    mainText: string,
    secondaryText: string
  ) => {
    Keyboard.dismiss();
    setSearchResults([]);
    setSearchText(mainText);

    try {
      const location = await fetchPlaceDetails(placeId);
      if (!location) return;

      const destCoord = {
        latitude: location.latitude,
        longitude: location.longitude,
        name: mainText,
        desc: secondaryText,
      };
      setDestination(destCoord);

      mapRef.current?.animateCamera(
        {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          zoom: 17,
          pitch: 0,
          heading: 0,
        },
        { duration: 1000 }
      );

      if (userLocation) {
        const directionData = await fetchDirections(userLocation, destCoord);
        if (directionData) {
          setRouteCoords(directionData.points);
          setTripDetails({
            distance: directionData.distance,
            duration: directionData.duration,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    mapRef.current?.animateCamera(
      { center: { latitude, longitude }, zoom: 17 },
      { duration: 500 }
    );

    const tempDest = {
      latitude,
      longitude,
      name: "Pinned Location",
      desc: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
    setDestination(tempDest);
    Keyboard.dismiss();
    setSearchResults([]); // Close search

    try {
      const address = await reverseGeocode(latitude, longitude);
      const finalDest = { ...tempDest, ...address };
      setDestination(finalDest);
      setSearchText(address.name);

      if (userLocation) {
        const directionData = await fetchDirections(userLocation, finalDest);
        if (directionData) {
          setRouteCoords(directionData.points);
          setTripDetails({
            distance: directionData.distance,
            duration: directionData.duration,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <GestureHandlerRootView className="flex-1">
        <HomeMap
          mapRef={mapRef}
          rideMode={rideMode}
          destination={destination}
          routeCoords={routeCoords}
          onMapPress={handleMapPress}
        />

        {/* 🔹 PERSISTENT SEARCH BAR */}
        <View className="absolute top-2 left-4 right-4 z-50">
          <View className="flex-row items-center bg-white p-3 rounded-full shadow-md border border-gray-200">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <TextInput
              placeholder="Where to?"
              className="flex-1 text-lg font-sans"
              value={searchText}
              onChangeText={handleSearch}
              autoFocus={!destination} // Auto focus if we don't have a destination yet
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          {/* SEARCH RESULTS DROPDOWN */}
          {searchResults.length > 0 && (
            <Animated.View
              entering={FadeInDown.springify()}
              className="bg-white rounded-2xl shadow-lg mt-2 overflow-hidden max-h-80"
            >
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.place_id}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="py-4 px-4 border-b border-gray-100 flex-row items-center"
                    onPress={() =>
                      handleSelectPlace(
                        item.place_id,
                        item.structured_formatting.main_text,
                        item.structured_formatting.secondary_text
                      )
                    }
                  >
                    <View className="bg-gray-100 p-3 rounded-full mr-3">
                      <Ionicons name="location" size={20} color="black" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-black text-base">
                        {item.structured_formatting.main_text}
                      </Text>
                      <Text
                        className="text-gray-500 text-sm mt-1"
                        numberOfLines={1}
                      >
                        {item.structured_formatting.secondary_text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          )}
        </View>

        {/* 🔹 BOOKING SHEET - ONLY CONDITIONAL */}
        {destination && (
          <BookingSheet
            isSelecting={false} // Always false here, we use top bar
            setIsSelecting={() => {}}
            destination={destination}
            rideMode={rideMode}
            setRideMode={setRideMode}
            userLocation={userLocation}
            currentCity={currentCity}
            tripDetails={tripDetails}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
