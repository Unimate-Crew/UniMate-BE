import { Injectable } from '@nestjs/common';
import { SnsService, SnsUserInfo } from './sns.service.interface';

@Injectable()
export class NaverSnsService implements SnsService {
  private readonly API_URL = 'https://openapi.naver.com/v1/nid/me';

  async getUserInfo(accessToken: string): Promise<SnsUserInfo> {
    const response = await fetch(this.API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Naver');
    }

    const data = await response.json();
    const userInfo = data.response;

    return {
      id: userInfo.id,
    };
  }
}
