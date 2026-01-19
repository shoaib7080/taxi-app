import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter, useSegments } from "expo-router";

type User = {
  id: string;
  email: string;
  fullName: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// This hook can be used in any component to get the user
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // 1. Check for token on App Start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("auth_token");
        const userData = await SecureStore.getItemAsync("user_data");

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error("Auth Load Error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // 2. Protect Routes (Redirect logic)
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // If not logged in & not in auth page -> Go to Login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // If logged in & on login page -> Go Home
      router.replace("/(tabs)");
    }
  }, [user, segments, isLoading]);

  // 3. Login Action
  const login = async (token: string, userData: User) => {
    setUser(userData);
    await SecureStore.setItemAsync("auth_token", token);
    await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
    router.replace("/(tabs)");
  };

  // 4. Logout Action
  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("user_data");
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
