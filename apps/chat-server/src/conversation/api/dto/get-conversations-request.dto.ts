import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PageRequest } from '@app/common/dto/page-request.dto';

export class GetConversationsRequestDto extends PageRequest {
  @ApiPropertyOptional({
    description:
      '상품 게시글 ID (판매자가 특정 상품의 채팅방만 조회할 때 사용)',
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  productPostId?: number;
}
