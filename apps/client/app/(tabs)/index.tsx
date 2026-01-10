import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Keyboard,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location"; // 🟢 REAL GPS
import { RideTypeToggle } from "../../components/RideTypeToggle";
import { Input } from "@/components/Input";
import {
  searchPlaces,
  fetchDirections,
  fetchPlaceDetails,
  reverseGeocode,
} from "../../services/google";
import { saveLocation, getLastLocation } from "../../services/storage";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInDown,
  FadeOutUp,
  SlideInDown,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Mock Cars (Still mock, as we don't have real drivers yet)
const CARS = [
  { id: 1, lat: 25.2048, lng: 55.2708, rotation: 45 },
  { id: 2, lat: 25.195, lng: 55.265, rotation: 90 },
];
const SAVER_CARS = [{ id: 4, lat: 24.4539, lng: 54.3773, rotation: 180 }];

export default function Home() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [rideMode, setRideMode] = useState<"instant" | "saver">("instant");
  const [userLocation, setUserLocation] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState("Current Location");
  const [destination, setDestination] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]); // The Blue Line
  const [isSelecting, setIsSelecting] = useState(false); // Search UI Mode

  // Trip Info
  const [tripDetails, setTripDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  // Search State
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // --- ANIMATIONS ---
  const uiTranslateY = useSharedValue(0);
  useEffect(() => {
    if (isSelecting) {
      uiTranslateY.value = withTiming(height, { duration: 500 }); // Slide down
    } else {
      uiTranslateY.value = withTiming(0, { duration: 500 }); // Slide up
    }
  }, [isSelecting]);
  const mainUiStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: uiTranslateY.value }],
      opacity: isSelecting ? withTiming(0) : withTiming(1),
    };
  });

  // 1. 🟢 GET REAL USER LOCATION
  useEffect(() => {
    (async () => {
      // A. Load Cache First (Instant UI)
      const cached = await getLastLocation();
      if (cached) {
        setUserLocation(cached);
        if (cached.city) setCurrentCity(cached.city);
      }

      // B. Request Fresh Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      // C. Get Fresh Location
      let location = await Location.getCurrentPositionAsync({});
      const newLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setUserLocation(newLoc);

      // D. Reverse Geocode (Get City Name)
      const address = await reverseGeocode(newLoc.latitude, newLoc.longitude);

      const city = address.city || "Unknown City";
      setCurrentCity(city);

      // E. Save to Cache
      await saveLocation({ ...newLoc, city });
    })();
  }, []);

  // 2. 🟢 REAL GOOGLE PLACES SEARCH
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }
    const results = await searchPlaces(text);
    setSearchResults(results);
  };

  // 3. 🟢 GET DETAILS & ROUTE WHEN PLACE SELECTED
  const handleSelectPlace = async (
    placeId: string,
    mainText: string,
    secondaryText: string
  ) => {
    Keyboard.dismiss();
    setSearchResults([]); // Hide the list
    setSearchText(mainText); // Show selected name in input
    // setIsSelecting(false); // <--- KEEP SEARCH MODE ACTIVE so user can see map

    try {
      // A. Get Coordinates of the Place
      const location = await fetchPlaceDetails(placeId);
      if (!location) return;

      const destCoord = {
        latitude: location.latitude,
        longitude: location.longitude,
        name: mainText,
        desc: secondaryText,
      };
      setDestination(destCoord);

      // B. FLy to the Exact Location (Zoom In)
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          zoom: 17, // Closer zoom for "exact location"
          pitch: 0,
          heading: 0,
        },
        { duration: 1000 }
      );

      // C. Get Directions (Update Route)
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

  // 4. 🟢 HANDLE MAP TAP (Reverse Geocode)
  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    // Animate to new pinned location
    mapRef.current?.animateCamera(
      {
        center: { latitude, longitude },
        zoom: 17,
      },
      { duration: 500 }
    );

    // Update Destination State immediately with coords
    const tempDest = {
      latitude,
      longitude,
      name: "Pinned Location",
      desc: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
    setDestination(tempDest);

    // Fetch Address & Directions
    try {
      // A. Reverse Geocode for Name
      const address = await reverseGeocode(latitude, longitude);
      const finalDest = { ...tempDest, ...address };
      setDestination(finalDest);
      setSearchText(address.name);

      // B. Update Route
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
    <View className="flex-1 bg-white">
      {/* --- MAP LAYER --- */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 25.2048,
          longitude: 55.2708,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        onPress={handleMapPress}
      >
        {/* Cars */}
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

        {/* Destination Marker */}
        {destination && (
          <Marker coordinate={destination}>
            <View className="bg-black p-2 rounded-lg">
              <Ionicons name="flag" color="white" size={16} />
            </View>
          </Marker>
        )}

        {/* Real Route Line */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor={rideMode === "saver" ? "#16A34A" : "black"}
            lineDashPattern={rideMode === "saver" ? [10, 10] : undefined}
          />
        )}
      </MapView>

      {/* Map Overlay for Transparency Effect (Only in Normal Mode) */}
      {!isSelecting && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 pointer-events-none"
          pointerEvents="none"
        />
      )}

      {/* LAYER 2: UI CONTAINER */}
      <SafeAreaView className="flex-1" pointerEvents="box-none">
        {/* --- MAIN DASHBOARD (Normally Visible) --- */}
        <Animated.View
          style={[mainUiStyle, { flex: 1 }]}
          pointerEvents={isSelecting ? "none" : "auto"}
        >
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

            {/* SEARCH INPUT TRIGGER */}
            <TouchableOpacity
              className="mt-6"
              onPress={() => setIsSelecting(true)}
              activeOpacity={0.9}
            >
              <View pointerEvents="none">
                <Input
                  icon="search"
                  placeholder="Enter destination"
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            {/* TRANSPORT TABS */}
            <View className="flex-row justify-between my-6">
              {["Car", "Taxi", "Bus", "Bike"].map((item, index) => {
                const isActive = index === 0;
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
              <View className="border-b border-gray-100 pb-4">
                <Text className="text-gray-400 text-xs font-sans mb-1">
                  From
                </Text>
                <Text
                  className="text-xl font-bold text-black"
                  numberOfLines={1}
                >
                  {currentCity}
                </Text>
                <Text
                  className="text-gray-500 text-sm font-sans"
                  numberOfLines={1}
                >
                  {userLocation ? "Your Location" : "Waiting for GPS..."}
                </Text>
              </View>

              <TouchableOpacity className="absolute right-8 top-[42%] bg-white p-2 rounded-full shadow-md z-10 border border-gray-50">
                <Ionicons name="swap-vertical" size={20} color="#171ACB" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSelecting(true)}
                className="pt-4"
              >
                <Text className="text-gray-400 text-xs font-sans mb-1">To</Text>
                <Text
                  className={`text-xl font-bold ${
                    destination ? "text-black" : "text-gray-400"
                  }`}
                  numberOfLines={1}
                >
                  {destination ? destination.name : "Select destination"}
                </Text>
                <Text
                  className="text-gray-500 text-sm font-sans"
                  numberOfLines={1}
                >
                  {destination ? destination.desc : "Tap to search"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* PRICE PREVIEW */}
            <View className="mt-6 bg-white p-4 rounded-2xl flex-row justify-between items-center border border-gray-100">
              <View>
                <Text className="text-gray-500 font-sans">Estimated Fare</Text>
                {tripDetails && (
                  <Text className="text-xs text-gray-400 mt-1">
                    {tripDetails.distance} • {tripDetails.duration}
                  </Text>
                )}
              </View>

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
            {/* <View className="flex-row mt-4 justify-between">
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
            </View> */}

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

            <View className="h-24" />
          </ScrollView>
        </Animated.View>

        {/* --- SELECTION / SEARCH MODE UI (Animated Entry) --- */}
        {isSelecting && (
          <Animated.View
            entering={FadeInDown.springify()}
            exiting={FadeOutUp}
            className="absolute top-0 left-0 right-0 bottom-0 pointer-events-box-none"
            pointerEvents="box-none"
          >
            {/* REAL SEARCH INPUT CONTAINER */}
            <View className="bg-white/95 px-5 pt-4 pb-2 shadow-sm rounded-b-2xl">
              <View className="flex-row items-center bg-gray-100 p-3 rounded-xl mb-2 border border-gray-200">
                <TouchableOpacity onPress={() => setIsSelecting(false)}>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <TextInput
                  autoFocus
                  placeholder="Where to?"
                  className="flex-1 ml-3 text-lg font-sans"
                  value={searchText}
                  onChangeText={handleSearch}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearch("")}>
                    <Ionicons name="close-circle" size={20} color="gray" />
                  </TouchableOpacity>
                )}
              </View>

              {/* LIST RESULTS (Only show if there are results) */}
              {searchResults.length > 0 && (
                <View className="max-h-80 bg-white rounded-xl shadow-lg mt-2 overflow-hidden">
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
                </View>
              )}
            </View>

            {/* BOTTOM CONFIRM BUTTON (Slide Up Animation) */}
            {destination && (
              <Animated.View
                entering={SlideInDown.springify().damping(150)}
                className="absolute bottom-10 left-5 right-5"
              >
                <TouchableOpacity
                  onPress={() => setIsSelecting(false)} // Confirm selection
                  className="bg-primary py-4 rounded-2xl items-center shadow-lg"
                >
                  <Text className="text-white font-bold text-lg">
                    Confirm Location
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
