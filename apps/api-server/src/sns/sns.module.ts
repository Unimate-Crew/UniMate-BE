import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NaverSnsService } from './naver-sns.service';
import { KakaoSnsService } from './kakao-sns.service';
import { AppleSnsService } from './apple-sns.service';
import { SnsServiceFactory } from './sns.service.factory';

@Module({
  imports: [ConfigModule],
  providers: [
    NaverSnsService,
    KakaoSnsService,
    AppleSnsService,
    SnsServiceFactory,
  ],
  exports: [SnsServiceFactory],
})
export class SnsModule {}
