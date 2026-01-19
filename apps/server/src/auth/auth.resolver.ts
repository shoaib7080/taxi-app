import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
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
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

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
  async createDriver(
    @Args('email') email: string,
    @Args('password') pass: string,
    @Args('fullName') fullName: string,
  ) {
    const user = await this.authService.registerDriver(email, pass, fullName);
    // Auto-login as DRIVER
    return this.authService.login(user);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') pass: string,
    @Args('appType') appType: string,
    @Args('pushToken', { nullable: true }) pushToken?: string,
  ) {
    const user = await this.authService.validateUser(email, pass, appType);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 2. SAVE THE TOKEN (If provided)
    if (pushToken) {
      await this.usersService.update(user.id, { pushToken });
    }

    return this.authService.login(user);
  }
}
