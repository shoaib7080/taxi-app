import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_KEY = "user_last_location";

export const saveLocation = async (location: {
  latitude: number;
  longitude: number;
  city: string;
}) => {
  try {
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    console.error("Error saving location:", error);
  }
};

export const getLastLocation = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(LOCATION_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error loading location:", error);
    return null;
  }
};
