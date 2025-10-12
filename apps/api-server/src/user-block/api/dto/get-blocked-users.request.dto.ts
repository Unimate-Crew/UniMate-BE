import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBlockedUsersRequestDto {
  @ApiProperty({
    description: '커서 (이전 응답의 nextCursor 값, 첫 페이지는 없이 주면 됨)',
    required: false,
    example: 123,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    default: 20,
    required: false,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;

  getCursor(): number | undefined {
    return this.cursor;
  }

  getPageSize(): number {
    return this.pageSize || 20;
  }
}
