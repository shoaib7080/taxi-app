import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesService } from './rides.service';
import { RidesResolver } from './rides.resolver';
import { RideOffer } from './entities/ride-offer.entity';
import { Ride } from './entities/ride.entity';
import { RidesGateway } from './rides.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride, RideOffer]),
    AuthModule,
    UsersModule, // <--- Added this to allow injection of UsersService
  ],
  providers: [RidesResolver, RidesService, RidesGateway],
})
export class RidesModule {}
