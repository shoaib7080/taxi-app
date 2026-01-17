import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. REGISTER
  async register(email: string, pass: string, fullName: string): Promise<User> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(pass, 10);

    return this.usersService.create({
      email,
      password: hashedPassword,
      fullName,
    });
  }

  // 2. LOGIN (Validate User)
  // FIX: Return type is Promise<User | null>
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    // FIX: Check if user has a password (google users might not)
    if (!user.password) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) return user;

    return null;
  }

  // 3. GENERATE TOKEN
  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }
}
