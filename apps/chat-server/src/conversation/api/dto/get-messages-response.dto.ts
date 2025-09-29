import { ApiProperty } from '@nestjs/swagger';
import { MessageSummaryDto } from './message-summary.dto';
import { GetMessagesResultDto } from '../../application/dto/get-messages-result.dto';

export class GetMessagesResponseDto {
  @ApiProperty({
    description: '메시지 목록',
    type: [MessageSummaryDto],
  })
  contents: MessageSummaryDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: '다음 커서 (마지막 메시지 번호, null이면 마지막 페이지)',
    example: 10,
    required: false,
  })
  nextCursor?: number;

  @ApiProperty({
    description:
      '참여자별 마지막 읽은 메시지 번호와 해당 번호까지 읽은 사용자 수 맵',
    example: { '10': 1, '13': 1 },
  })
  readStatusMap: Record<string, number>;

  public static from(result: GetMessagesResultDto): GetMessagesResponseDto {
    const dto = new GetMessagesResponseDto();
    dto.contents = result.messages.map((message) =>
      MessageSummaryDto.from(message),
    );
    dto.hasNext = result.hasNext;
    dto.nextCursor = result.nextCursor;
    dto.readStatusMap = result.readStatusMap || {};
    return dto;
  }
}
