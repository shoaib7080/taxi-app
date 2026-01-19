import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Input } from "../Input";

interface FakeSearchBarProps {
  onPress: () => void;
}

export const FakeSearchBar = ({ onPress }: FakeSearchBarProps) => {
  return (
    <TouchableOpacity className="mt-6" onPress={onPress} activeOpacity={0.9}>
      <View pointerEvents="none">
        <Input icon="search" placeholder="Enter destination" editable={false} />
      </View>
    </TouchableOpacity>
  );
};
