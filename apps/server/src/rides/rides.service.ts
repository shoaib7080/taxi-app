import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride, RideStatus } from './entities/ride.entity';
import { RideOffer, RideOfferStatus } from './entities/ride-offer.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride) private ridesRepo: Repository<Ride>,
    @InjectRepository(RideOffer) private offersRepo: Repository<RideOffer>,
  ) {}

  async createInstantRide(
    user: User,
    origin: { lat: number; lng: number },
    dest: { lat: number; lng: number },
    price: number,
  ): Promise<Ride> {
    // 1. Create the Main Ride (Dubai -> Abu Dhabi)
    const rideOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const ride = this.ridesRepo.create({
      user,
      originLat: origin.lat,
      originLng: origin.lng,
      destLat: dest.lat,
      destLng: dest.lng,
      price: price,
      status: RideStatus.SEARCHING,
      rideOtp: rideOtp,
    });

    const savedRide = await this.ridesRepo.save(ride);

    // 2. Trigger Ride Offer (For other users to accept)
    return savedRide;
  }

  async startRide(rideId: string, otp: string, driverId: string) {
    // driverId added for context
    const ride = await this.ridesRepo.findOne({
      where: { id: rideId },
      relations: ['user'],
    });

    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.rideOtp !== otp) throw new BadRequestException('Invalid OTP');

    // 1. Update Status
    ride.status = RideStatus.CONFIRMED;
    await this.ridesRepo.save(ride);

    // 2. TRIGGER GHOST RIDE (The Return Trip)
    // Available approx when they arrive (now + estimated duration)
    const estimatedDurationHours = 1; // You can calculate this based on distance later
    const availableTime = new Date();
    availableTime.setHours(availableTime.getHours() + estimatedDurationHours);

    const ghostRide = this.offersRepo.create({
      linkedRide: ride,
      originLat: ride.destLat, // Start where User A drops off
      originLng: ride.destLng,
      destLat: ride.originLat, // End where User A started
      destLng: ride.originLng,
      price: Math.floor(ride.price * 0.5),
      availableTime: availableTime,
      status: RideOfferStatus.AVAILABLE,
    });

    return this.offersRepo.save(ghostRide);
  }

  // 1. SEARCH: Find Ghost Rides nearby
  async findSaverRides(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
  ): Promise<RideOffer[]> {
    const radiusMeters = 5000; // 5km Radius

    return (
      this.offersRepo
        .createQueryBuilder('offer')
        .leftJoinAndSelect('offer.linkedRide', 'ride') // Get details of the original ride too
        .leftJoinAndSelect('ride.user', 'driverUser') // Get the "Driver" (Original Passenger) info
        .where('offer.status = :status', { status: RideOfferStatus.AVAILABLE })
        // Check Pickup Distance (using PostGIS math)
        .andWhere(
          `ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(offer.originLng, offer.originLat), 4326),
          ST_SetSRID(ST_MakePoint(:pickupLng, :pickupLat), 4326)
        ) <= :radius`,
          {
            pickupLng: pickup.lng,
            pickupLat: pickup.lat,
            radius: radiusMeters,
          },
        )
        // Check Dropoff Distance
        .andWhere(
          `ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(offer.destLng, offer.destLat), 4326),
          ST_SetSRID(ST_MakePoint(:dropoffLng, :dropoffLat), 4326)
        ) <= :radius`,
          {
            dropoffLng: dropoff.lng,
            dropoffLat: dropoff.lat,
            radius: radiusMeters,
          },
        )
        .getMany()
    );
  }

  // 2. BOOK: Claim a Ghost Ride
  async bookSaverRide(user: User, offerId: string): Promise<Ride> {
    const offer = await this.offersRepo.findOne({
      where: { id: offerId },
      relations: ['linkedRide'],
    });

    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.status !== RideOfferStatus.AVAILABLE) {
      throw new BadRequestException('This ride is no longer available');
    }

    // A. Lock the Offer
    offer.status = RideOfferStatus.BOOKED;
    await this.offersRepo.save(offer);

    // B. Create the "Ticket" (The Ride Record for User B)
    const rideOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const ride = this.ridesRepo.create({
      user, //user b
      originLat: offer.originLat,
      originLng: offer.originLng,
      destLat: offer.destLat,
      destLng: offer.destLng,
      price: offer.price, // The discounted price!
      status: RideStatus.SEARCHING, // Use SEARCHING so we can assign the specific driver next
      rideOtp: rideOtp,
      // We could add a 'type' column later to distinguish SAVER vs INSTANT
    });

    return this.ridesRepo.save(ride);
  }

  remove(id: number) {
    return `This action removes a #${id} ride`;
  }
}
