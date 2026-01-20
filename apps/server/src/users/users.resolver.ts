import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  // Query: "Get me all users"
  @Query(() => [User])
  getUsers() {
    return this.usersService.findAll();
  }

  // Mutation: "Change data" (Create a user)
  @Mutation(() => User)
  createUser(@Args('fullName') fullName: string, @Args('phone') phone: string) {
    return this.usersService.create({ fullName, phone });
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updatePushToken(
    @Args('token') token: string,
    @Context() context: any, // To get the logged-in user
  ) {
    const userId = context.req.user.id;
    return this.usersService.updatePushToken(userId, token);
  }
}
