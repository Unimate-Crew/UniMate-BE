import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Slice, PageRequest, ErrorCode, SqsClient } from '@app/common';
import { University, UniversityRepository } from '@app/database';
import {
  VerificationCodeCacheRepository,
  VerificationCodeCache,
} from '@app/redis';
import { Country } from '../../common/enums';
import { UniversityResultDto } from './dto/university.result.dto';

@Injectable()
export class UniversityService {
  private readonly VERIFICATION_CODE_TTL = 600; // 10분 (600초)

  constructor(
    private readonly universityRepository: UniversityRepository,
    private readonly verificationCodeCacheRepository: VerificationCodeCacheRepository,
    private readonly sqsClient: SqsClient,
    private readonly configService: ConfigService,
  ) {}

  async searchUniversities(params: {
    name?: string;
    pageRequest: PageRequest;
  }): Promise<Slice<UniversityResultDto>> {
    const universitySlice: Slice<University> =
      await this.universityRepository.searchUniversities({
        name: params.name,
        pageRequest: params.pageRequest,
      });

    return universitySlice.map(
      (university) =>
        new UniversityResultDto(
          university.getId(),
          university.getName(),
          university.getCountry() as Country,
        ),
    );
  }

  async sendVerificationCode(userId: number, email: string): Promise<number> {
    // 1. 이메일에서 도메인 추출
    const domain: string = this.extractDomain(email);

    // 2. 대학교 도메인 검증
    const university: University =
      await this.universityRepository.findByDomain(domain);

    if (!university) {
      throw new NotFoundException({
        code: ErrorCode.UNIVERSITY_NOT_FOUND,
        message: '등록되지 않은 대학교 도메인입니다.',
      });
    }

    // 3. 6자리 인증코드 생성
    const code: string = this.generateVerificationCode();

    // 4. Redis에 인증코드, 이메일, universityId 저장 (TTL: 600초)
    await this.verificationCodeCacheRepository.setVerificationCode(
      userId,
      VerificationCodeCache.from({
        code,
        email,
        universityId: university.id,
      }),
      this.VERIFICATION_CODE_TTL,
    );

    // 5. SQS로 이메일 발송 요청
    await this.sqsClient.sendMessage(
      this.configService.get<string>('VERIFICATION_EMAIL_QUEUE_URL'),
      {
        email,
        code,
        timestamp: new Date().toISOString(),
      },
    );

    // 6. 인증코드 유효 기간 반환
    return this.VERIFICATION_CODE_TTL;
  }

  private extractDomain(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) {
      throw new NotFoundException({
        code: ErrorCode.INVALID_UNIVERSITY_EMAIL,
        message: '유효하지 않은 이메일 형식입니다.',
      });
    }
    return parts[1];
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
