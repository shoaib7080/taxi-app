import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface RideTypeToggleProps {
  mode: "instant" | "saver";
  setMode: (mode: "instant" | "saver") => void;
}

export const RideTypeToggle = ({ mode, setMode }: RideTypeToggleProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Padding inside the container
  const PADDING = 4;

  // Calculate tab width based on container width
  const tabWidth = (containerWidth - PADDING * 2) / 2;

  useEffect(() => {
    if (containerWidth > 0) {
      translateX.value = withSpring(mode === "instant" ? 0 : tabWidth, {
        damping: 50,
        stiffness: 300,
      });
    }
  }, [mode, containerWidth, tabWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      className="bg-gray-100 p-1 rounded-2xl flex-row relative h-14 items-center"
    >
      {/* The Sliding Dark Pill Background */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            {
              width: tabWidth,
              position: "absolute",
              top: PADDING,
              bottom: PADDING,
              left: PADDING,
              borderRadius: 12, // slightly less than container
              backgroundColor: "#1F2937", // dark-gray-800 or black
            },
            animatedStyle,
          ]}
        />
      )}

      {/* Instant Tab Button */}
      <TouchableOpacity
        className="flex-1 items-center justify-center z-10"
        onPress={() => setMode("instant")}
      >
        <Text
          className={`font-bold font-sans ${
            mode === "instant" ? "text-white" : "text-gray-500"
          }`}
        >
          Instant Ride
        </Text>
      </TouchableOpacity>

      {/* Saver Tab Button */}
      <TouchableOpacity
        className="flex-1 items-center justify-center z-10"
        onPress={() => setMode("saver")}
      >
        <Text
          className={`font-bold font-sans ${
            mode === "saver" ? "text-white" : "text-gray-500"
          }`}
        >
          Smart Saver
        </Text>
      </TouchableOpacity>
    </View>
  );
};
