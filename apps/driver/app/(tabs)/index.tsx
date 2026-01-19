import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function DriverHome() {
  // --- STATE ---
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  // --- 1. GET LOCATION ON LOAD ---
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location access to receive rides.",
        );
        return;
      }

      // This will pull from your "Fake GPS" app if running!
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const toggleOnline = () => {
    // TODO: Call Backend Mutation (Update Driver Status)
    setIsOnline(!isOnline);
  };

  if (!location) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#171ACB" />
        <Text className="mt-4 font-sans text-secondary">Locating GPS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 2. THE MAP */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
      >
        {/* If we have a ride, we will draw the line here */}
      </MapView>

      {/* 3. STATUS HEADER */}
      <SafeAreaView className="absolute top-0 w-full p-4">
        <View className="bg-white/90 p-4 rounded-2xl flex-row items-center shadow-sm border border-gray-100 backdrop-blur-md">
          <View
            className={`w-3 h-3 rounded-full mr-3 ${isOnline ? "bg-green-500" : "bg-red-500"}`}
          />
          <View>
            <Text className="font-bold text-lg font-sans">
              {isOnline ? "You are Online" : "You are Offline"}
            </Text>
            <Text className="text-secondary text-xs font-sans">
              {isOnline
                ? "Looking for nearby rides..."
                : "Go online to start earning"}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* 4. THE BIG BUTTON */}
      <View className="absolute bottom-10 w-full px-6">
        <TouchableOpacity
          onPress={toggleOnline}
          activeOpacity={0.8}
          className={`w-full py-4 rounded-full items-center shadow-lg ${
            isOnline ? "bg-red-500" : "bg-primary"
          }`}
        >
          <Text className="text-white font-bold text-xl font-sans uppercase tracking-widest">
            {isOnline ? "Go Offline" : "Go Online"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
});
