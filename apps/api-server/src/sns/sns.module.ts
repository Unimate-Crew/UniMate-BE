import { Module } from '@nestjs/common';
import { NaverSnsService } from './application/naver-sns.service';
import { KakaoSnsService } from './application/kakao-sns.service';
import { SnsServiceFactory } from './application/sns.service.factory';

@Module({
  providers: [NaverSnsService, KakaoSnsService, SnsServiceFactory],
  exports: [SnsServiceFactory],
})
export class SnsModule {}
