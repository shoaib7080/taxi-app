import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔴 YOUR KEY (Best practice: Move to .env later)
const GOOGLE_API_KEY = "YOUR_API_KEY_HERE";

interface LocationSearchOverlayProps {
  onClose: () => void;
  onSelectLocation: (location: {
    lat: number;
    lng: number;
    name: string;
  }) => void;
}

export const LocationSearchOverlay = ({
  onClose,
  onSelectLocation,
}: LocationSearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  // 1. 🟢 REAL GOOGLE AUTOCOMPLETE
  const searchPlaces = async (text: string) => {
    setQuery(text);
    if (text.length < 3) return;

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_API_KEY}&components=country:ae`;
      const response = await fetch(url);
      const data = await response.json();
      setResults(data.predictions || []);
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  // 2. 🟢 GET COORDINATES FOR SELECTION
  const handleSelect = async (placeId: string, name: string) => {
    Keyboard.dismiss();
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      const location = data.result.geometry.location;

      // Pass real data back to Parent
      onSelectLocation({
        lat: location.lat,
        lng: location.lng,
        name: name,
      });
    } catch (error) {
      console.error("Details Error:", error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header / Input */}
        <View className="px-5 pt-2 pb-4 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 p-3 rounded-xl">
            <TouchableOpacity onPress={onClose} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <TextInput
              autoFocus
              placeholder="Where to?"
              className="flex-1 text-lg font-sans text-black"
              value={query}
              onChangeText={searchPlaces}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={results}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="px-5 py-4 border-b border-gray-50 flex-row items-center active:bg-gray-50"
              onPress={() =>
                handleSelect(
                  item.place_id,
                  item.structured_formatting.main_text
                )
              }
            >
              <View className="bg-gray-100 p-2 rounded-full mr-4">
                <Ionicons name="location-sharp" size={20} color="#4B5563" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-black text-base">
                  {item.structured_formatting.main_text}
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  {item.structured_formatting.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
};
