import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { RideTypeToggle } from "../RideTypeToggle";
import { HomeHeader } from "./HomeHeader";
import { FakeSearchBar } from "./FakeSearchBar";

const { height } = Dimensions.get("window");

const VEHICLES = [
  { id: "standard", name: "Standard", multiplier: 1, image: "car-sport" },
  { id: "premium", name: "Premium", multiplier: 1.4, image: "star" },
  { id: "xl", name: "XL", multiplier: 1.8, image: "bus" },
];

interface BookingSheetProps {
  isSelecting: boolean;
  setIsSelecting: (val: boolean) => void;
  destination: any;
  rideMode: "instant" | "saver";
  setRideMode: (mode: "instant" | "saver") => void;
  userLocation: any;
  currentCity: string;
  tripDetails: { distance: string; duration: string } | null;
  selectedVehicle: string;
  setSelectedVehicle: (id: string) => void;
  onSearchPress?: () => void;
}

export const BookingSheet = ({
  isSelecting,
  setIsSelecting,
  destination,
  rideMode,
  setRideMode,
  userLocation,
  currentCity,
  tripDetails,
  selectedVehicle,
  setSelectedVehicle,
  onSearchPress,
}: BookingSheetProps) => {
  const router = useRouter();

  // --- ANIMATIONS & GESTURES ---
  const uiTranslateY = useSharedValue(height); // Start off-screen or at bottom
  const context = useSharedValue({ y: 0 });

  const SNAP_TOP = height * 0.3; // 80% visible (Top)
  const SNAP_MID = height * 0.55; // ~45% visible (Middle)
  const SNAP_BOTTOM = height * 0.8; // 15% visible (Bottom/Peek)

  useEffect(() => {
    if (isSelecting) {
      uiTranslateY.value = withTiming(height, { duration: 500 });
    } else if (destination) {
      // Slide up to "Peek" (SNAP_BOTTOM) when destination is set
      uiTranslateY.value = withTiming(SNAP_BOTTOM, { duration: 500 });
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
      // If we are selecting, we don't want the sheet visible, or maybe we do depending on design.
      // But based on previous logic: opacity: isSelecting ? 0 : 1
      opacity: isSelecting ? withTiming(0) : withTiming(1),
    };
  });

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
        pointerEvents="box-none"
      >
        <View className="flex-1" pointerEvents="box-none">
          <ScrollView
            className="px-5 pt-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            scrollEnabled={isSelecting || !!destination}
          >
            {destination && (
              <View className="items-center mb-2 pt-2">
                <View className="w-12 h-1 bg-gray-300 rounded-full" />
              </View>
            )}

            {!destination && (
              <>
                <HomeHeader />
                <FakeSearchBar
                  onPress={() =>
                    onSearchPress ? onSearchPress() : setIsSelecting(true)
                  }
                />
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
                onPress={() =>
                  onSearchPress ? onSearchPress() : setIsSelecting(true)
                }
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
                      VEHICLES.find((v) => v.id === selectedVehicle)?.name ||
                      "Ride"
                    }`
                  : "Search Rides"}
              </Text>
            </TouchableOpacity>

            <View className="h-48" />
          </ScrollView>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};
