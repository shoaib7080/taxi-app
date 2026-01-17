import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateRideInput {
  @Field(() => Float)
  originLat: number;

  @Field(() => Float)
  originLng: number;

  @Field(() => Float)
  destLat: number;

  @Field(() => Float)
  destLng: number;

  @Field(() => Float)
  price: number;
}
