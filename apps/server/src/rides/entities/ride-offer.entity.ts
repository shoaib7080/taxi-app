import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { Ride } from './ride.entity';

export enum RideOfferStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(RideOfferStatus, { name: 'RideOfferStatus' });

@Entity()
@ObjectType()
export class RideOffer {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  // The Ghost Ride starts where the Original Ride ends
  @Column({ type: 'float' })
  @Field(() => Float)
  originLat: number;

  @Column({ type: 'float' })
  @Field(() => Float)
  originLng: number;

  // The Ghost Ride ends where the Original Ride started
  @Column({ type: 'float' })
  @Field(() => Float)
  destLat: number;

  @Column({ type: 'float' })
  @Field(() => Float)
  destLng: number;

  @Column()
  @Field()
  price: number; // This will be 50% of the original price

  @Column()
  @Field()
  availableTime: Date; // When the car will be ready

  @Column({
    type: 'enum',
    enum: RideOfferStatus,
    default: RideOfferStatus.AVAILABLE,
  })
  @Field(() => RideOfferStatus)
  status: RideOfferStatus;

  // LINK: This offer belongs to a specific "Parent" ride
  @OneToOne(() => Ride, (ride) => ride.generatedOffer)
  @JoinColumn()
  linkedRide: Ride;

  @Column()
  linkedRideId: string;

  @CreateDateColumn()
  createdAt: Date;
}
