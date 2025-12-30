import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ title, onPress, variant = 'primary' }: ButtonProps) => {
  const baseStyle = "w-full py-4 rounded-2xl items-center justify-center";
  const bgStyle = variant === 'primary' ? "bg-primary" : "bg-white border border-gray-200";
  const textStyle = variant === 'primary' ? "text-white font-bold text-lg" : "text-black font-bold text-lg";

  return (
    <TouchableOpacity onPress={onPress} className={`${baseStyle} ${bgStyle}`}>
      <Text className={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};