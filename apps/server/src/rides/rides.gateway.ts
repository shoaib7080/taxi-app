import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

import Expo from 'expo-server-sdk';
import { UsersService } from '../users/users.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RidesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('RidesGateway');
  private expo = new Expo();

  constructor(private usersService: UsersService) {}

  // Map to track driverId -> socketId (for quick lookups)
  private driverSocketMap = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Cleanup driver map if needed
    // In a real app, you'd find the driverId for this socket and remove it
  }

  // 1. DRIVER GOES ONLINE
  @SubscribeMessage('driver.online')
  handleDriverOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { driverId: string; city: string; lat: number; lng: number },
  ) {
    // A. Join the City Room (Coarse Filtering)
    const cityRoom = `drivers_${payload.city.toLowerCase()}`;
    client.join(cityRoom);

    // B. Tag the Socket with Data (In-Memory State)
    client.data.driverId = payload.driverId;
    client.data.city = payload.city;
    client.data.lat = payload.lat;
    client.data.lng = payload.lng;
    client.data.isBusy = false; // <--- DEFAULT TO AVAILABLE

    this.driverSocketMap.set(payload.driverId, client.id);

    this.logger.log(`Driver ${payload.driverId} is ONLINE in ${cityRoom}`);

    // Optional: Send ack back
    client.emit('status.update', { status: 'ONLINE' });
  }

  // 2. DRIVER UPDATES LOCATION (Runs every 5-10s from App)
  @SubscribeMessage('driver.location')
  handleDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { lat: number; lng: number },
  ) {
    // Update in-memory data only (Fast!)
    client.data.lat = payload.lat;
    client.data.lng = payload.lng;
  }

  // 3. DRIVER GOES OFFLINE
  @SubscribeMessage('driver.offline')
  handleDriverOffline(@ConnectedSocket() client: Socket) {
    const city = client.data.city;
    if (city) {
      client.leave(`drivers_${city.toLowerCase()}`);
    }
    this.driverSocketMap.delete(client.data.driverId);
    client.data.isBusy = false;

    this.logger.log(`Driver ${client.data.driverId} is OFFLINE`);
  }

  // --- INTERNAL METHODS CALLED BY SERVICE ---

  /**
   * Broadcast a new Ride Request to nearby, available drivers
   */
  notifyNearbyDrivers(ride: any, city: string) {
    const cityRoom = `drivers_${city.toLowerCase()}`;
    const allSockets = this.server.sockets.adapter.rooms.get(cityRoom);

    if (!allSockets || allSockets.size === 0) {
      this.logger.warn(`No drivers found in ${cityRoom}`);
      return;
    }

    // Convert Set to Array of Socket IDs
    const socketIds = Array.from(allSockets);

    // Filter & Send
    let count = 0;
    const notifiedDriverIds: string[] = [];

    for (const socketId of socketIds) {
      const socket = this.server.sockets.sockets.get(socketId);

      if (!socket) continue;

      // CHECK 1: Availability
      if (socket.data.isBusy) continue; // Skip occupied drivers

      // CHECK 2: Distance (Haversine)
      const distance = this.calculateDistance(
        ride.originLat,
        ride.originLng,
        socket.data.lat,
        socket.data.lng,
      );

      if (distance <= 5) {
        // 5km Radius
        socket.emit('job.new', ride);
        notifiedDriverIds.push(socket.data.driverId);
        count++;
      }
    }

    // --- SEND PUSH NOTIFICATIONS ---
    // We notify drivers even if they are connected to socket (to ensure they see it if app is backgrounded)
    // In a real app, you might check if they ack the socket event first.
    this.sendPushToDrivers(notifiedDriverIds, ride);

    this.logger.log(`Notified ${count} drivers for Ride ${ride.id}`);
  }

  private async sendPushToDrivers(driverIds: string[], ride: any) {
    if (driverIds.length === 0) return;

    try {
      // 1. Get Users to find Tokens
      // Note: We need a method in UsersService to find multiple users, or we loop.
      // For MVP, loop is fine, or one query.
      const users = await Promise.all(
        driverIds.map((id) => this.usersService.findOne(id)),
      );

      const tokens = users
        .map((u) => u?.pushToken)
        .filter((t) => t && Expo.isExpoPushToken(t)) as string[];

      if (tokens.length === 0) return;

      // 2. Send Notifications
      const messages = tokens.map((token) => ({
        to: token,
        sound: 'default' as const,
        title: 'New Ride Request! 🚕',
        body: `New job in ${ride.originLat.toFixed(3)}, ${ride.originLng.toFixed(3)}`,
        data: { rideId: ride.id, type: 'NEW_RIDE' },
        priority: 'high' as const,
        channelId: 'default',
      }));

      // Expo handles batching automatically if we pass array, but sendPushNotificationsAsync takes chunks.
      // Simple usage:
      let chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        try {
          await this.expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          this.logger.error('Error sending push chunk', error);
        }
      }
      this.logger.log(`Sent Push to ${tokens.length} drivers`);
    } catch (e) {
      this.logger.error('Failed to send push notifications', e);
    }
  }

  /**
   * Mark a driver as BUSY so they stop receiving requests
   */
  setDriverBusy(driverId: string, isBusy: boolean) {
    const socketId = this.driverSocketMap.get(driverId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.data.isBusy = isBusy;
        this.logger.log(`Driver ${driverId} busy status set to: ${isBusy}`);
      }
    }
  }

  // Helper: Haversine Distance in KM
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
