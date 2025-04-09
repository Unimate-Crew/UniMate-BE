import { Module } from '@nestjs/common';
import { NaverSnsService } from './naver-sns.service';
import { KakaoSnsService } from './kakao-sns.service';
import { SnsServiceFactory } from './sns.service.factory';

@Module({
  providers: [NaverSnsService, KakaoSnsService, SnsServiceFactory],
  exports: [SnsServiceFactory],
})
export class SnsModule {}
