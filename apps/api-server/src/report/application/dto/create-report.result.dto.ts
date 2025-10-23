import { ReportReason } from '@app/database/common/enums';

export class CreateReportResultDto {
  reportId: number;

  userId: number;

  targetUserId: number;

  reason: ReportReason;

  detail: string;

  userBlocked: boolean;

  private constructor(params: {
    reportId: number;
    userId: number;
    targetUserId: number;
    reason: ReportReason;
    detail: string;
    userBlocked: boolean;
  }) {
    this.reportId = params.reportId;
    this.userId = params.userId;
    this.targetUserId = params.targetUserId;
    this.reason = params.reason;
    this.detail = params.detail;
    this.userBlocked = params.userBlocked;
  }

  static of(params: {
    reportId: number;
    userId: number;
    targetUserId: number;
    reason: ReportReason;
    detail: string;
    userBlocked: boolean;
  }): CreateReportResultDto {
    return new CreateReportResultDto(params);
  }
}
