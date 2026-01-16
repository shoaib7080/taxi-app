import React, { useState, useRef, useEffect } from "react";
import { View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline"; // You might need: npm install @mapbox/polyline

// Components
import { MapBackground } from "@/components/home/MapBackground";
import { BookingSheet } from "@/components/home/BookingSheet";
import { LocationSearchOverlay } from "@/components/home/LocationSearchOverlay";
import { TopBar } from "@/components/home/TopBar";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export default function Home() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // --- STATE ---
  const [rideMode, setRideMode] = useState<"instant" | "saver">("instant");
  const [isSelecting, setIsSelecting] = useState(false);

  // Real Data States
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]); // The Blue Line
  const [destination, setDestination] = useState<any>(null);

  // 1. 🟢 INITIALIZE LOCATION
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const current = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserLocation(current);

      // Animate Map to User
      mapRef.current?.animateToRegion({
        ...current,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  // 2. 🟢 FETCH DIRECTIONS (The Real Route)
  const fetchRealRoute = async (destLat: number, destLng: number) => {
    if (!userLocation) return;

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destLat},${destLng}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        // Decode the polyline points
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        setRouteCoords(coords);

        // Zoom map to fit both points
        mapRef.current?.fitToCoordinates(
          [
            {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
            { latitude: destLat, longitude: destLng },
          ],
          {
            edgePadding: { top: 100, right: 50, bottom: 400, left: 50 }, // Bottom padding respects the BookingSheet
            animated: true,
          }
        );
      }
    } catch (error) {
      console.error("Directions Error:", error);
    }
  };

  // 3. 🟢 HANDLER FOR SELECTION
  const handleLocationSelected = (loc: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    setDestination(loc);
    setIsSelecting(false);
    fetchRealRoute(loc.lat, loc.lng); // <--- Trigger Route Calculation
  };

  return (
    <View className="flex-1 bg-white relative">
      {/* MAP LAYER */}
      <MapBackground
        mapRef={mapRef}
        rideMode={rideMode}
        route={routeCoords} // Passing the REAL route
        isSelecting={isSelecting}
      />

      {/* UI LAYER */}
      <SafeAreaView className="flex-1" pointerEvents="box-none">
        {isSelecting ? (
          /* OVERLAY MODE */
          <LocationSearchOverlay
            onClose={() => setIsSelecting(false)}
            onSelectLocation={handleLocationSelected}
          />
        ) : (
          /* HOME MODE */
          <View className="flex-1 justify-between" pointerEvents="box-none">
            <TopBar />

            <BookingSheet
              rideMode={rideMode}
              setRideMode={setRideMode}
              onSearchPress={() => setIsSelecting(true)}
              onConfirmPress={() =>
                router.push({
                  pathname: "/book-ride",
                  params: { mode: rideMode },
                })
              }
              // Optional: Pass destination name to show inside the fake search bar
              destinationName={destination?.name}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
