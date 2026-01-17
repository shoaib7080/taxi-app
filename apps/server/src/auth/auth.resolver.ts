import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

@ObjectType()
class AuthResponse {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signup(
    @Args('email') email: string,
    @Args('password') pass: string,
    @Args('fullName') fullName: string,
  ) {
    const user = await this.authService.register(email, pass, fullName);
    return this.authService.login(user);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('email') email: string, @Args('password') pass: string) {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
