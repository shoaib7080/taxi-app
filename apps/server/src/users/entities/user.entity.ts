import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Ride } from '../../rides/entities/ride.entity';
import { DriverDetails } from './driver-details.entity';

@Entity() // <--- Database: "This is a table named 'user'"
@ObjectType() // <--- GraphQL: "This is an object users can query"
export class User {
  @PrimaryGeneratedColumn('uuid') // Generates a unique ID like "a1b2-c3d4..."
  @Field(() => ID) // Expose this field to GraphQL
  id: string;

  @Column({ unique: true })
  @Field()
  email: string;

  // We DO NOT expose password to GraphQL (@Field is missing)
  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  googleId?: string; // For Google Login later

  @Column()
  @Field()
  fullName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string; // Phone is optional at signup now

  @Column({ default: false })
  @Field()
  isPhoneVerified: boolean;

  @Column({
    type: 'simple-array',
    default: 'RIDER',
  })
  @Field(() => [String])
  roles: string[];

  @OneToOne(() => DriverDetails, (details) => details.user, { nullable: true })
  @Field(() => DriverDetails, { nullable: true })
  driverDetails: DriverDetails;

  @OneToMany(() => Ride, (ride) => ride.user)
  @Field(() => [Ride], { nullable: true })
  rides: Ride[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
