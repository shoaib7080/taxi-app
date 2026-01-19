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
import { ACCEPT_RIDE_MUTATION } from "../../graphql/mutations";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { useSocket } from "../../context/SocketContext";
import { useMutation } from "@apollo/client/react";

const { width, height } = Dimensions.get("window");

export default function DriverHome() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    isOnline,
    connectDriver,
    disconnectDriver,
    incomingRide,
    setIncomingRide,
  } = useSocket();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const [acceptRide, { loading: acceptLoading }] = useMutation(
    ACCEPT_RIDE_MUTATION,
    {
      onCompleted: (data) => {
        setIncomingRide(null); // Close Modal
        Alert.alert("Success", "You have accepted the ride!");
        // TODO: Navigate to Navigation Screen
        // router.push({ pathname: "/navigation", params: { rideId: data.acceptRide.id } });
      },
      onError: (err) => Alert.alert("Error", err.message),
    },
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
    if (!location) return Alert.alert("Wait", "Getting GPS...");

    if (isOnline) {
      disconnectDriver();
    } else {
      // Hardcoded City "Dubai" for now.
      connectDriver(
        "Dubai",
        location.coords.latitude,
        location.coords.longitude,
      );
    }
  };

  const handleAccept = () => {
    if (!incomingRide || !user) return;
    acceptRide({
      variables: {
        rideId: incomingRide.id,
        driverId: user.id,
      },
    });
  };

  const handleReject = () => {
    setIncomingRide(null);
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

      {/* ONLINE BUTTON */}
      {!incomingRide && (
        <View className="absolute bottom-10 w-full px-6">
          <TouchableOpacity
            onPress={toggleOnline}
            className={`w-full py-4 rounded-full items-center shadow-lg ${isOnline ? "bg-red-500" : "bg-primary"}`}
          >
            <Text className="text-white font-bold text-xl font-sans uppercase tracking-widest">
              {isOnline ? "Go Offline" : "Go Online"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- INCOMING RIDE POPUP (THE MODAL) --- */}
      {incomingRide && (
        <View className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-2xl p-6 pb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold font-sans">
              New Request! ⚡️
            </Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-bold">
                {incomingRide.price} AED
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="bg-gray-100 p-3 rounded-full mr-4">
              <Ionicons name="location" size={24} color="black" />
            </View>
            <View>
              <Text className="text-secondary text-xs">
                Pickup is 2 mins away
              </Text>
              <Text className="font-bold text-lg">Downtown Dubai</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleReject}
              className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
            >
              <Text className="font-bold text-lg text-gray-600">Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              className="flex-1 bg-black py-4 rounded-xl items-center"
            >
              <Text className="font-bold text-lg text-white">
                {acceptLoading ? "Accepting..." : "Accept Ride"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
});
