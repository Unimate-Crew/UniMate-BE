import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { User } from '@app/database';
import { AuthService } from '../auth.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('NAVER_CLIENT_ID'),
      clientSecret: configService.get('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get('NAVER_CALLBACK_URL'),
      state: 'RANDOM_STATE',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<User> {
    try {
      // eslint-disable-next-line no-underscore-dangle
      const jsonProfile = profile._json;
      const user: User = await this.authService.validateNaverUser({
        id: jsonProfile.id,
        name: jsonProfile.name,
        mobile: jsonProfile.mobile,
      });

      return user;
    } catch (error) {
      console.error('Error in Naver validation:', error);
      throw error;
    }
  }
}
