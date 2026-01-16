import { View, TextInput, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Input = ({ icon, ...props }: InputProps) => {
  return (
    <View className="flex-row items-center bg-white py-3 px-4 rounded-full shadow-sm border border-gray-100">
      {icon && <Ionicons name={icon} size={20} color="gray" className="mr-3" />}
      <TextInput
        className="flex-1 text-base text-black font-sans"
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
};
