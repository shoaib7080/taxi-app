// test-driver.js
const { io } = require("socket.io-client");

// 1. CONNECT
const socket = io("http://localhost:3000");

const MY_DRIVER_ID = "driver_123";
const MY_CITY = "Dubai";
// Location: Dubai Mall (25.1972, 55.2744)
const MY_LOCATION = { lat: 25.1972, lng: 55.2744 };

socket.on("connect", () => {
  console.log("✅ Connected to Server via Socket!");

  // 2. GO ONLINE
  socket.emit("driver.online", {
    driverId: MY_DRIVER_ID,
    city: MY_CITY,
    lat: MY_LOCATION.lat,
    lng: MY_LOCATION.lng,
  });
});

// 3. LISTEN FOR JOBS
socket.on("job.new", (ride) => {
  console.log("\n🚗 NEW RIDE RECEIVED!");
  console.log("-----------------------");
  console.log(`Ride ID: ${ride.id}`);
  console.log(`Price: ${ride.price} AED`);
  console.log(`Pickup: ${ride.originLat}, ${ride.originLng}`);
  console.log("-----------------------\n");
});

socket.on("disconnect", () => console.log("❌ Disconnected"));
