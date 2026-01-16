import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInDown,
} from "react-native-reanimated";

interface SearchOverlayProps {
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearch: (text: string) => void;
  searchResults: any[];
  onSelectPlace: (
    placeId: string,
    mainText: string,
    secondaryText: string
  ) => void;
  onClose: () => void;
  destination: any;
  onConfirmLocation: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  searchText,
  setSearchText,
  handleSearch,
  searchResults,
  onSelectPlace,
  onClose,
  destination,
  onConfirmLocation,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutUp}
      className="absolute top-0 left-0 right-0 bottom-0 pointer-events-box-none bg-white/95"
      // Added background color because it covers the whole screen
      style={{ zIndex: 50 }}
    >
      {/* SafeArea Wrapper - or just padding */}
      <View className="flex-1">
        <View className="px-5 pt-4 pb-2 shadow-sm rounded-b-2xl">
          <View className="flex-row items-center bg-gray-100 p-3 rounded-xl mb-2 border border-gray-200">
            <TouchableOpacity onPress={onClose}>
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
                      onSelectPlace(
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
              onPress={onConfirmLocation}
              className="bg-primary py-4 rounded-2xl items-center shadow-lg"
            >
              <Text className="text-white font-bold text-lg">
                Confirm Location
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};
