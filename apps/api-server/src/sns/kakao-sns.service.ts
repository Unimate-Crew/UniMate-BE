import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SnsService, SnsUserInfo } from './sns.service.interface';
import { ErrorCode } from '../common/error-code';

@Injectable()
export class KakaoSnsService implements SnsService {
  private readonly API_URL = 'https://kapi.kakao.com/v2/user/me';

  async getUserInfo(oAuthToken: string): Promise<SnsUserInfo> {
    try {
      const response = await fetch(this.API_URL, {
        headers: {
          Authorization: `Bearer ${oAuthToken}`,
        },
      });

      if (response.status === 401) {
        throw new UnauthorizedException({
          code: ErrorCode.INVALID_SNS_TOKEN,
          message: 'Invalid Kakao access token',
        });
      }

      const data = await response.json();

      return {
        id: data.id.toString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Failed to fetch user info from Kakao: ${error.message}`);
    }
  }
}
