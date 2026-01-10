import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

// Mock Cars
const CARS = [
  { id: 1, lat: 25.2048, lng: 55.2708, rotation: 45 },
  { id: 2, lat: 25.195, lng: 55.265, rotation: 90 },
];
const SAVER_CARS = [{ id: 4, lat: 24.4539, lng: 54.3773, rotation: 180 }];

interface HomeMapProps {
  mapRef: React.RefObject<MapView>;
  rideMode: "instant" | "saver";
  userLocation: any;
  destination: any;
  routeCoords: any[];
  onMapPress: (e: any) => void;
}

export const HomeMap = ({
  mapRef,
  rideMode,
  userLocation,
  destination,
  routeCoords,
  onMapPress,
}: HomeMapProps) => {
  return (
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
      onPress={onMapPress}
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
  );
};
