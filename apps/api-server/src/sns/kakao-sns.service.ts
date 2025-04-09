import { Injectable } from '@nestjs/common';
import { SnsService, SnsUserInfo } from './sns.service.interface';

@Injectable()
export class KakaoSnsService implements SnsService {
  private readonly API_URL = 'https://kapi.kakao.com/v2/user/me';

  async getUserInfo(accessToken: string): Promise<SnsUserInfo> {
    const response = await fetch(this.API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Kakao');
    }

    const data = await response.json();

    return {
      id: data.id.toString(),
    };
  }
}
