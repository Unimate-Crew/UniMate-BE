import { Injectable } from '@nestjs/common';
import { OAuthProvider } from '@app/database';
import { SnsService } from './sns.service.interface';
import { NaverSnsService } from './naver-sns.service';
import { KakaoSnsService } from './kakao-sns.service';
import { AppleSnsService } from './apple-sns.service';

@Injectable()
export class SnsServiceFactory {
  constructor(
    private readonly naverSnsService: NaverSnsService,
    private readonly kakaoSnsService: KakaoSnsService,
    private readonly appleSnsService: AppleSnsService,
  ) {}

  getService(provider: OAuthProvider): SnsService {
    switch (provider) {
      case OAuthProvider.NAVER:
        return this.naverSnsService;
      case OAuthProvider.KAKAO:
        return this.kakaoSnsService;
      case OAuthProvider.APPLE:
        return this.appleSnsService;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
