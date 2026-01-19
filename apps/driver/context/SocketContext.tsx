import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

// REPLACE WITH YOUR COMPUTER'S LOCAL IP OR NGROK URL
const SOCKET_URL = "https://distinguishedly-unmodernized-claris.ngrok-free.dev";

interface SocketContextType {
  socket: Socket | null;
  isOnline: boolean;
  connectDriver: (city: string, lat: number, lng: number) => void;
  disconnectDriver: () => void;
  incomingRide: any | null; // Stores the ride request when it comes in
  setIncomingRide: (ride: any | null) => void;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState<any | null>(null);

  const connectDriver = (city: string, lat: number, lng: number) => {
    if (!user) return;

    // 1. Initialize Connection
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], // Force WebSocket for better performance
      reconnection: true,
    });

    // 2. Setup Listeners
    newSocket.on("connect", () => {
      console.log("✅ Driver Connected to Socket");
      setIsOnline(true);

      // Tell Backend we are here!
      newSocket.emit("driver.online", {
        driverId: user.id,
        city: city, // In real app, get this from Geocoding
        lat,
        lng,
      });
    });

    // 3. LISTEN FOR JOBS (The Magic Part)
    newSocket.on("job.new", (ride) => {
      console.log("🚗 NEW RIDE RECEIVED:", ride);
      setIncomingRide(ride); // This triggers the UI Modal
    });

    setSocket(newSocket);
  };

  const disconnectDriver = () => {
    if (socket) {
      socket.emit("driver.offline");
      socket.disconnect();
      setIsOnline(false);
      setSocket(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isOnline,
        connectDriver,
        disconnectDriver,
        incomingRide,
        setIncomingRide,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
