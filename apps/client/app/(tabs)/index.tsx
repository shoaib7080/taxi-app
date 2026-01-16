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
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
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
  withSpring,
  withTiming,
  FadeInDown,
  FadeOutUp,
  SlideInDown,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

// Mock Cars
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

  // Mock Vehicles State
  const VEHICLES = [
    { id: "standard", name: "Standard", multiplier: 1, image: "car-sport" },
    { id: "premium", name: "Premium", multiplier: 1.4, image: "star" },
    { id: "xl", name: "XL", multiplier: 1.8, image: "bus" },
  ];
  const [selectedVehicle, setSelectedVehicle] = useState("standard");

  // --- ANIMATIONS & GESTURES ---
  const uiTranslateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const SNAP_TOP = height * 0.3; // 70% visible (Top)
  const SNAP_MID = height * 0.55; // ~45% visible (Middle/Default)
  const SNAP_BOTTOM = height * 0.8; // 20% visible (Bottom/Collapsed)

  useEffect(() => {
    if (isSelecting) {
      uiTranslateY.value = withTiming(height, { duration: 500 });
    } else if (destination) {
      uiTranslateY.value = withTiming(SNAP_MID, { duration: 500 });
    } else {
      uiTranslateY.value = withTiming(0, { duration: 500 });
    }
  }, [isSelecting, destination]);

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { y: uiTranslateY.value };
    })
    .onUpdate((event) => {
      if (!destination) return; // Only drag when in booking mode
      uiTranslateY.value = event.translationY + context.value.y;
      // Clamp values
      if (uiTranslateY.value < SNAP_TOP) uiTranslateY.value = SNAP_TOP;
    })
    .onEnd(() => {
      if (!destination) return;
      const current = uiTranslateY.value;

      // Snap Logic (Nearest Neighbor)
      const distTop = Math.abs(current - SNAP_TOP);
      const distMid = Math.abs(current - SNAP_MID);
      const distBot = Math.abs(current - SNAP_BOTTOM);

      if (distTop < distMid && distTop < distBot) {
        uiTranslateY.value = withSpring(SNAP_TOP, {
          damping: 50,
          stiffness: 300,
        });
      } else if (distBot < distMid && distBot < distTop) {
        uiTranslateY.value = withSpring(SNAP_BOTTOM, {
          damping: 50,
          stiffness: 300,
        });
      } else {
        uiTranslateY.value = withSpring(SNAP_MID, {
          damping: 50,
          stiffness: 300,
        });
      }
    });

  const mainUiStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: uiTranslateY.value }],
      opacity: isSelecting ? withTiming(0) : withTiming(1),
    };
  });

  // --- BACK HANDLER ---
  useEffect(() => {
    const onBackPress = () => {
      if (isSelecting) {
        setIsSelecting(false);
        return true;
      }
      if (destination) {
        setDestination(null);
        setRouteCoords([]); // Clear route
        return true;
      }
      return false; // Default behavior (exit app)
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [isSelecting, destination]);

  // --- MOCK PRICING LOGIC ---
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
    setIsSelecting(false);

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
    setIsSelecting(false);

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
      <GestureHandlerRootView className="flex-1">
        {/* 🔹 MAP WITH GESTURE RECOGNIZER TO CLOSE KEYBOARD/SELECTION IF NEEDED? NO */}
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
          {destination && (
            <Marker coordinate={destination}>
              <View className="bg-black p-2 rounded-lg">
                <Ionicons name="flag" color="white" size={16} />
              </View>
            </Marker>
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor={rideMode === "saver" ? "#16A34A" : "black"}
              lineDashPattern={rideMode === "saver" ? [10, 10] : undefined}
            />
          )}
        </MapView>

        {!isSelecting && !destination && (
          <View
            className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 pointer-events-none"
            pointerEvents="none"
          />
        )}

        {/* 🔹 DRAGGABLE UI SHEET */}
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              mainUiStyle,
              {
                flex: 1,
                backgroundColor: destination ? "white" : "transparent",
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                overflow: "hidden",
              },
            ]}
            pointerEvents="box-none" // Allow touch through to map if transparent, but here we manage it manually
          >
            {/* We need a View wrapper to capture gestures properly on the whole sheet surface */}
            <View className="flex-1" pointerEvents="box-none">
              <ScrollView
                className="px-5 pt-2"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                scrollEnabled={isSelecting || !!destination} // Disable main scroll if in "Full Screen overlay mode"? No, usually always scrollable.
              >
                {destination && (
                  <View className="items-center mb-2 pt-2">
                    <View className="w-12 h-1 bg-gray-300 rounded-full" />
                  </View>
                )}

                {!destination && (
                  <>
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
                  </>
                )}

                <View className={destination ? "mt-2" : "mt-6"}>
                  <RideTypeToggle mode={rideMode} setMode={setRideMode} />
                </View>

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

                  <TouchableOpacity
                    onPress={() => setIsSelecting(true)}
                    className="pt-4"
                  >
                    <Text className="text-gray-400 text-xs font-sans mb-1">
                      To
                    </Text>
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

                {/* HORIZONTAL VEHICLE LIST */}
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

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/book-ride",
                      params: {
                        mode: rideMode,
                        vehicle: selectedVehicle,
                        price: calculateFare(
                          tripDetails?.distance,
                          VEHICLES.find((v) => v.id === selectedVehicle)
                            ?.multiplier || 1
                        ),
                      },
                    })
                  }
                  className={`mt-6 rounded-2xl py-4 items-center shadow-lg active:opacity-90 ${
                    rideMode === "saver" ? "bg-green-600" : "bg-black"
                  }`}
                >
                  <Text className="text-white text-lg font-bold font-sans">
                    {destination
                      ? `Book ${
                          VEHICLES.find((v) => v.id === selectedVehicle)
                            ?.name || "Ride"
                        }`
                      : "Search Rides"}
                  </Text>
                </TouchableOpacity>

                <View className="h-48" />
              </ScrollView>
            </View>
          </Animated.View>
        </GestureDetector>

        {isSelecting && (
          <Animated.View
            entering={FadeInDown.springify()}
            exiting={FadeOutUp}
            className="absolute top-0 left-0 right-0 bottom-0 pointer-events-box-none"
            pointerEvents="box-none"
          >
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
            {destination && (
              <Animated.View
                entering={SlideInDown.springify().damping(150)}
                className="absolute bottom-10 left-5 right-5"
              >
                <TouchableOpacity
                  onPress={() => setIsSelecting(false)}
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
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
