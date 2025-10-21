import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRepository } from '@app/database';
import { TokenPayloadDto, TokenType } from '../dto/token-payload.dto';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayloadDto): Promise<User> {
    // 토큰 타입 검증
    if (payload.type !== TokenType.REFRESH) {
      throw new UnauthorizedException('Invalid token type');
    }

    // 사용자 조회
    const user: User | null = await this.userRepository.findById(
      payload.userId,
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 저장된 리프레시 토큰과 비교
    const currentToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (user.getRefreshToken() !== currentToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
