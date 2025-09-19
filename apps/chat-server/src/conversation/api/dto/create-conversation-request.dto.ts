import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationRequestDto {
  @ApiProperty({
    description: '상품 게시글 ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  productPostId!: number;
}
