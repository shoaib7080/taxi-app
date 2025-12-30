import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide the top header
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute', // Transparent background on iOS
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // We will add icons later
        }}
      />
    </Tabs>
  );
}