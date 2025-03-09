import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, User, UserRepository } from '@app/database';
import { NaverProfileDto } from './dto/naver-profile.dto';
import { TokenPayloadDto, TokenType } from './dto/token-payload.dto';
import { SocialLoginCallbackResultDto } from './dto/social-login-callback.dto';
import { TokensDto } from './dto/tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateNaverUser(profile: NaverProfileDto): Promise<User> {
    let user: User | null = await this.userRepository.findByProviderId(
      AuthProvider.NAVER,
      profile.id,
    );

    if (!user) {
      user = this.userRepository.create({
        name: profile.name,
        phoneNumber: profile.mobile,
        provider: AuthProvider.NAVER,
        providerId: profile.id,
      });
      await this.userRepository.persistAndFlush(user);
    }

    return user;
  }

  async handleSocialLoginCallback(
    user: User,
    redirectUrlParam: string,
  ): Promise<SocialLoginCallbackResultDto> {
    let baseRedirectUrl = redirectUrlParam;

    // URL이 유효한지 확인하고, 유효하지 않으면 기본 URL 사용
    try {
      // URL이 프로토콜을 포함하는지 확인
      if (
        !baseRedirectUrl.startsWith('http://') &&
        !baseRedirectUrl.startsWith('https://')
      ) {
        // 개발 환경에서는 http://localhost:3000을 기본으로 사용
        baseRedirectUrl = `http://localhost:3000${baseRedirectUrl.startsWith('/') ? '' : '/'}${baseRedirectUrl}`;
      }
      // URL 유효성 테스트
      const validatedUrl = new URL(baseRedirectUrl);
      if (!validatedUrl) {
        throw new Error('Invalid URL');
      }
    } catch (error) {
      baseRedirectUrl = 'http://localhost:3000';
    }

    // 이미 가입 완료된 사용자인 경우
    if (user.getIsSignUpCompleted()) {
      const tokens = await this.generateTokens(user);

      // URL에 토큰을 쿼리 파라미터로 추가
      const redirectUrl = new URL(baseRedirectUrl);
      redirectUrl.searchParams.append('accessToken', tokens.accessToken);
      redirectUrl.searchParams.append('refreshToken', tokens.refreshToken);

      return {
        redirectUrl: redirectUrl.toString(),
        tokens,
      };
    }

    // 가입이 완료되지 않은 사용자인 경우
    // 회원가입 페이지로 리다이렉트 (사용자 ID를 쿼리 파라미터로 전달)
    const signUpUrl = new URL('/signup', baseRedirectUrl);
    // 임시 토큰 생성 (회원가입 완료 시 사용)
    const tempToken = await this.generateAccessToken(
      user.getId(),
      user.getProvider(),
    );

    signUpUrl.searchParams.append('token', tempToken);

    return {
      redirectUrl: signUpUrl.toString(),
    };
  }

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

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateAccessToken(
    userId: number,
    provider: AuthProvider,
  ): Promise<string> {
    const payload: TokenPayloadDto = {
      userId,
      provider,
      type: TokenType.ACCESS,
    };

    return this.jwtService.sign(payload);
  }
}
