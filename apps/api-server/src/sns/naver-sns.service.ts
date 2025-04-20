import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SnsService, SnsUserInfo } from './sns.service.interface';
import { ErrorCode } from '../common/error-code';

@Injectable()
export class NaverSnsService implements SnsService {
  private readonly API_URL = 'https://openapi.naver.com/v1/nid/me';

  async getUserInfo(accessToken: string): Promise<SnsUserInfo> {
    try {
      const response = await fetch(this.API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        throw new UnauthorizedException({
          code: ErrorCode.INVALID_SNS_TOKEN,
          message: 'Invalid Naver access token',
        });
      }

      const data = await response.json();
      const userInfo = data.response;

      return {
        id: userInfo.id,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Failed to fetch user info from Naver: ${error.message}`);
    }
  }
}
