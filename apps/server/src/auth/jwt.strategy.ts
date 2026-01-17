import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      // 1. Look for token in the 'Authorization: Bearer <token>' header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. IMPORTANT: This secret must match the one in auth.module.ts
      secretOrKey: 'SUPER_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // 3. This runs after the token is verified.
    // We check if the user actually exists in the DB.
    // payload.sub is the userId we saved in the token.
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
