import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Register the Entity
  providers: [UsersService, UsersResolver], // Register Logic and API
  exports: [UsersService],
})
export class UsersModule {}
