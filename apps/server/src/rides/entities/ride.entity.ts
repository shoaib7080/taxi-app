import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { RideOffer } from './ride-offer.entity';

export enum RideStatus {
  SEARCHING = 'SEARCHING',
  ACCEPTED = 'ACCEPTED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(RideStatus, { name: 'RideStatus' });

@Entity()
@ObjectType()
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  // This is the property the User entity is looking for!
  @ManyToOne(() => User, (user) => user.rides)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'float' })
  @Field(() => Float)
  originLat: number;

  @Column({ type: 'float' })
  @Field(() => Float)
  originLng: number;

  @Column({ type: 'float' })
  @Field(() => Float)
  destLat: number;

  @Column({ type: 'float' })
  @Field(() => Float)
  destLng: number;

  @Column({ type: 'float' })
  @Field(() => Float)
  price: number;

  @Column({
    type: 'enum',
    enum: RideStatus,
    default: RideStatus.SEARCHING,
  })
  @Field(() => RideStatus)
  status: RideStatus;

  @Column({ nullable: true })
  rideOtp: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @OneToOne(() => RideOffer, (offer) => offer.linkedRide)
  @Field(() => RideOffer, { nullable: true })
  generatedOffer: RideOffer;
}
