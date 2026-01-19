import { Resolver, Mutation, Args, Query, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';
import { CreateRideInput } from './dto/create-ride.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RideOffer } from './entities/ride-offer.entity';

@Resolver(() => Ride)
export class RidesResolver {
  constructor(private readonly ridesService: RidesService) {}

  @Mutation(() => Ride)
  @UseGuards(GqlAuthGuard) // <--- Only logged-in users can do this
  async bookInstantRide(
    @Args('createRideInput') input: CreateRideInput,
    @CurrentUser() user: User, // <--- Get the user from the token
  ) {
    // We map the flat Input DTO to the structure our Service expects
    return this.ridesService.createInstantRide(
      user,
      { lat: input.originLat, lng: input.originLng },
      { lat: input.destLat, lng: input.destLng },
      input.price,
    );
  }
  @Mutation(() => RideOffer) // It returns the new Ghost Ride offer!
  async startRide(
    @Args('rideId') rideId: string,
    @Args('otp') otp: string,
    @Args('driverId') driverId: string,
  ) {
    return this.ridesService.startRide(rideId, otp, driverId);
  }

  @Query(() => [RideOffer])
  async findSmartSaverRides(
    @Args('pickupLat', { type: () => Float }) pickupLat: number,
    @Args('pickupLng', { type: () => Float }) pickupLng: number,
    @Args('destLat', { type: () => Float }) destLat: number,
    @Args('destLng', { type: () => Float }) destLng: number,
  ) {
    return this.ridesService.findSaverRides(
      { lat: pickupLat, lng: pickupLng },
      { lat: destLat, lng: destLng },
    );
  }

  @Mutation(() => Ride)
  @UseGuards(GqlAuthGuard)
  async bookSmartSaverRide(
    @Args('offerId') offerId: string,
    @CurrentUser() user: User,
  ) {
    return this.ridesService.bookSaverRide(user, offerId);
  }

  @Mutation(() => Ride)
  async acceptRide(
    @Args('rideId') rideId: string,
    @Args('driverId') driverId: string, // Simulated for now
  ) {
    return this.ridesService.acceptRide(rideId, driverId);
  }

  // Also add a Query to fetch a Single Ride (for Polling)
  @Query(() => Ride)
  async getRide(@Args('id') id: string) {
    return this.ridesService.findOne(id); // You need to add findOne to service
  }
}
