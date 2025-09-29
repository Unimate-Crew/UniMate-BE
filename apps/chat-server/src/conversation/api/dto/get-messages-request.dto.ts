import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesRequestDto {
  @ApiProperty({
    description: '페이지 크기 (최대 100)',
    default: 50,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 50;

  @ApiProperty({
    description:
      '마지막 메시지 번호 (커서 페이지네이션용, 이 번호 이전의 메시지들을 조회)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  lastMessageNumber?: number;

  public getPageSize(): number {
    return this.pageSize || 50;
  }

  public getLastMessageNumber(): number | undefined {
    return this.lastMessageNumber;
  }
}
