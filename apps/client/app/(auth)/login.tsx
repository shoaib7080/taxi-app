import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-between py-10"
      >
        <View>
          {/* LOGO / BRANDING */}
          <View className="items-center mb-12 mt-10">
             <View className="w-20 h-20 bg-black rounded-3xl items-center justify-center mb-4">
                <Ionicons name="car-sport" size={40} color="white" />
             </View>
             <Text className="text-3xl font-bold font-sans text-black">Get Started</Text>
             <Text className="text-gray-500 mt-2 font-sans text-center">
               Enter your mobile number to request a ride
             </Text>
          </View>

          {/* PHONE INPUT */}
          <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Mobile Number</Text>
          <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 h-16 px-4">
             {/* Country Code */}
             <View className="flex-row items-center border-r border-gray-300 pr-3 mr-3">
               <Image 
                 source={{ uri: 'https://flagcdn.com/w80/ae.png' }} 
                 className="w-6 h-4 rounded-sm mr-2"
               />
               <Text className="text-lg font-bold text-black">+971</Text>
             </View>
             
             {/* Input Field */}
             <TextInput 
                className="flex-1 text-lg font-bold text-black h-full font-sans"
                placeholder="50 123 4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={phone}
                onChangeText={setPhone}
             />
          </View>
        </View>

        {/* BOTTOM BUTTON */}
        <View>
           <Text className="text-xs text-center text-gray-400 mb-6 px-4">
              By continuing, you agree to our <Text className="text-black font-bold">Terms</Text> and <Text className="text-black font-bold">Privacy Policy</Text>.
           </Text>
           <TouchableOpacity 
             onPress={() => router.push('/otp')} 
             className={`w-full py-4 rounded-2xl items-center shadow-lg ${phone.length > 5 ? 'bg-primary shadow-blue-900/20' : 'bg-gray-200'}`}
             disabled={phone.length <= 5}
           >
             <Text className={`text-lg font-bold font-sans ${phone.length > 5 ? 'text-white' : 'text-gray-400'}`}>
               Continue
             </Text>
           </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}