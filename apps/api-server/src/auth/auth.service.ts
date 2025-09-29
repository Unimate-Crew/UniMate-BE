import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuthProvider, User, UserRepository } from '@app/database';
import { TokenPayloadDto, TokenType } from '@app/auth';
import { TokensDto } from './dto/tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(user: User): Promise<TokensDto> {
    const accessPayload: TokenPayloadDto = {
      userId: user.getId(),
      provider: user.getProvider(),
      type: TokenType.ACCESS,
    };

    const refreshPayload: TokenPayloadDto = {
      userId: user.getId(),
      provider: user.getProvider(),
      type: TokenType.REFRESH,
    };

    const accessToken = this.jwtService.sign(accessPayload);
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    });

    user.changeRefreshToken(refreshToken);
    await this.userRepository.persistAndFlush(user);

    return TokensDto.of(accessToken, refreshToken)
  }

  async generateAccessToken(
    userId: number,
    provider: OAuthProvider,
  ): Promise<string> {
    const payload: TokenPayloadDto = {
      userId,
      provider,
      type: TokenType.ACCESS,
    };

    return this.jwtService.sign(payload);
  }
}
