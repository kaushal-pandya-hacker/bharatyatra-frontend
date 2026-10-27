import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { resolveJwtSecret } from '../config/auth-secret.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(),
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (user && user.status === 'ACTIVE') {
        const { passwordHash, ...result } = user;
        return result;
      }
    } catch (e) {
      throw new UnauthorizedException('Database unavailable or authentication failed');
    }

    throw new UnauthorizedException('User account not found or suspended');
  }
}
