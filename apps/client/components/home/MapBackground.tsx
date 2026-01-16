import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

// Types for props to keep it strict
interface MapBackgroundProps {
  mapRef: React.RefObject<MapView>;
  rideMode: "instant" | "saver";
  route: any[]; // The route coordinates
  isSelecting: boolean; // Are we picking a location?
}

export const MapBackground = ({
  mapRef,
  rideMode,
  route,
  isSelecting,
}: MapBackgroundProps) => {
  // Static Demo Data
  const CARS = [{ id: 1, lat: 25.2048, lng: 55.2708, rotation: 45 }];
  const SAVER_CARS = [{ id: 4, lat: 24.4539, lng: 54.3773, rotation: 180 }];

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
      customMapStyle={[
        { featureType: "poi", stylers: [{ visibility: "off" }] },
      ]}
    >
      {/* 1. Cars */}
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

      {/* 2. Route Line (Hide during selection) */}
      {!isSelecting && route.length > 0 && (
        <Polyline
          coordinates={route}
          strokeColor={rideMode === "saver" ? "#16A34A" : "black"}
          strokeWidth={4}
          lineDashPattern={rideMode === "saver" ? [10, 10] : undefined}
        />
      )}
    </MapView>
  );
};
