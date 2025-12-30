import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DriverDetails() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background relative">
      <ScrollView className="px-5 pb-32">
        
        {/* HEADER */}
        <View className="flex-row items-center mt-2 mb-6">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center mr-10">
             <Text className="text-xl font-bold font-sans text-black">Driver Details</Text>
          </View>
        </View>

        {/* DRIVER PROFILE CARD */}
        <View className="items-center mt-4">
          <View className="p-1 rounded-full border-2 border-primary border-dashed">
            <View className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden items-center justify-center">
               <Ionicons name="person" size={60} color="gray" />
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-black mt-3 font-sans">Carlos Santos</Text>
          
          {/* Tags */}
          <View className="flex-row space-x-3 mt-3">
             <View className="flex-row items-center bg-white px-3 py-1 rounded-full shadow-sm">
                <Ionicons name="location-sharp" size={14} color="#171ACB" />
                <Text className="text-xs ml-1 text-gray-600 font-sans">Philippines</Text>
             </View>
             <View className="flex-row items-center bg-white px-3 py-1 rounded-full shadow-sm">
                <Ionicons name="language" size={14} color="#10B981" />
                <Text className="text-xs ml-1 text-gray-600 font-sans">English</Text>
             </View>
          </View>
        </View>

        {/* STATS ROW */}
        <View className="flex-row justify-between bg-white p-6 rounded-3xl shadow-sm mt-8 mx-2">
            <View className="items-center flex-1 border-r border-gray-100">
                <Text className="text-lg font-bold text-black">1,600km</Text>
                <Text className="text-xs text-gray-400 mt-1">Ride Experience</Text>
            </View>
            <View className="items-center flex-1 border-r border-gray-100">
                <Text className="text-lg font-bold text-black">4.9</Text>
                <Text className="text-xs text-gray-400 mt-1">Rating</Text>
            </View>
            <View className="items-center flex-1">
                <Text className="text-lg font-bold text-black">4 Years</Text>
                <Text className="text-xs text-gray-400 mt-1">Experience</Text>
            </View>
        </View>

        {/* REVIEWS SECTION */}
        <View className="flex-row justify-between items-end mt-8 mb-4">
            <Text className="text-lg font-bold font-sans">Reviews <Text className="text-gray-400 text-sm font-normal">(150)</Text></Text>
            <TouchableOpacity>
                <Text className="text-primary text-sm font-bold">View All</Text>
            </TouchableOpacity>
        </View>

        {/* SINGLE REVIEW CARD */}
        <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
                    <View>
                        <Text className="font-bold text-black">Devon Lane</Text>
                        <Text className="text-xs text-gray-400">Passenger</Text>
                    </View>
                </View>
                <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                    <Text className="ml-1 text-xs font-bold text-black">5.0</Text>
                </View>
            </View>
            <Text className="text-gray-500 leading-5 text-sm font-sans">
                "I requested expedited service, and the driver arrived for pickup quicker than I expected. Overall, it was a fantastic experience!"
            </Text>
        </View>

      </ScrollView>

      {/* BOTTOM ACTION BAR (Floating) */}
      <View className="absolute bottom-8 left-5 right-5 flex-row justify-between space-x-4">
          <TouchableOpacity className="flex-1 bg-white py-4 rounded-2xl items-center flex-row justify-center shadow-lg border border-gray-100">
             <Ionicons name="call-outline" size={24} color="black" />
             <Text className="ml-2 font-bold text-black font-sans">Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 bg-primary py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-blue-900/20">
             <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
             <Text className="ml-2 font-bold text-white font-sans">Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-16 bg-green-500 py-4 rounded-2xl items-center justify-center shadow-lg">
             <Ionicons name="logo-whatsapp" size={24} color="white" />
          </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}