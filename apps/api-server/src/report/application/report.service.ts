import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { ReportRepository } from '@app/database/entites/report/report.repository';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { Report } from '@app/database/entites/report/report.entity';
import { User } from '@app/database/entites/user/user.entity';
import { ErrorCode } from '@app/common';
import { ReportReason } from '@app/database/common/enums';
import { UserBlockService } from '../../user-block/application/user-block.service';
import { CreateReportResultDto } from './dto/create-report.result.dto';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
    private readonly userBlockService: UserBlockService,
  ) {}

  /**
   * 유저 신고 생성
   *
   * @param params.userId 신고하는 유저 ID
   * @param params.targetUserId 신고 대상 유저 ID
   * @param params.reason 신고 이유
   * @param params.detail 신고 내용
   * @returns 생성된 신고 결과 DTO
   */
  @Transactional()
  async createReport(params: {
    userId: number;
    targetUserId: number;
    reason: ReportReason;
    detail: string;
  }): Promise<CreateReportResultDto> {
    // 1. 본인 신고 방지
    if (params.userId === params.targetUserId) {
      throw new BadRequestException({
        code: ErrorCode.REPORT_SELF_NOT_ALLOWED,
        message: '본인은 신고할 수 없습니다.',
      });
    }

    // 2. 신고 대상 유저 존재 확인
    const targetUser: User | null = await this.userRepository.findById(
      params.targetUserId,
    );

    if (!targetUser) {
      throw new NotFoundException({
        code: ErrorCode.REPORT_TARGET_USER_NOT_FOUND,
        message: '신고 대상 유저를 찾을 수 없습니다.',
      });
    }

    // 3. 중복 신고 확인
    const existingReport: Report | null =
      await this.reportRepository.findByUserIdAndTargetUserId(
        params.userId,
        params.targetUserId,
      );

    if (existingReport) {
      throw new ConflictException({
        code: ErrorCode.REPORT_ALREADY_EXISTS,
        message: '이미 신고한 유저입니다.',
      });
    }

    // 4. 신고 생성
    const report: Report = this.reportRepository.create({
      userId: params.userId,
      targetUserId: params.targetUserId,
      reason: params.reason,
      detail: params.detail,
    });

    await this.reportRepository.flush();

    // 5. 부적절한 성적 행위 신고인 경우 자동 차단
    let userBlocked = false;

    if (params.reason === ReportReason.SEXUAL_HARASSMENT) {
      try {
        await this.userBlockService.blockUser({
          blockerId: params.userId,
          blockedId: params.targetUserId,
        });
        userBlocked = true;
      } catch (error) {
        // 이미 차단된 경우 무시 (신고는 정상 처리)
        if (error instanceof ConflictException) {
          userBlocked = true;
        } else {
          throw error;
        }
      }
    }

    return CreateReportResultDto.of({
      reportId: report.getId(),
      userId: report.getUserId(),
      targetUserId: report.getTargetUserId(),
      reason: report.getReason(),
      detail: report.getDetail(),
      userBlocked,
    });
  }
}
