import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from './user.entity';

export enum DriverApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(DriverApprovalStatus, { name: 'DriverApprovalStatus' });

@Entity()
@ObjectType()
export class DriverDetails {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  licenseNumber: string;

  @Column()
  @Field()
  vehicleType: string; // e.g., "Sedan", "SUV"

  @Column({ nullable: true })
  @Field({ nullable: true })
  vehicleColor: string;

  @Column()
  @Field()
  vehiclePlate: string;

  @Column('float', { default: 5.0 })
  @Field()
  rating: number;

  @Column({ default: false })
  @Field()
  isOnline: boolean;

  @Column({
    type: 'enum',
    enum: DriverApprovalStatus,
    default: DriverApprovalStatus.PENDING,
  })
  @Field(() => DriverApprovalStatus)
  approvalStatus: DriverApprovalStatus;

  @OneToOne(() => User, (user) => user.driverDetails)
  @JoinColumn()
  @Field(() => User)
  user: User;
}
