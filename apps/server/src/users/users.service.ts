import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // <--- We ask NestJS for the User Table
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  // 1. Find all users
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  update(id: string, userData: Partial<User>): Promise<User> {
    return this.usersRepository.save({ id, ...userData });
  }

  async updatePushToken(userId: string, token: string): Promise<User | null> {
    const user = await this.findOne(userId);
    if (user) {
      user.pushToken = token;
      return this.usersRepository.save(user);
    }
    return null;
  }
}
