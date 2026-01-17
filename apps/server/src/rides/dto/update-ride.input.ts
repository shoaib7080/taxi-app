import { CreateRideInput } from './create-ride.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRideInput extends PartialType(CreateRideInput) {
  @Field(() => Int)
  id: number;
}
