import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkMessagesAsReadRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  conversationId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lastReadMessageNumber: number;

  @IsString()
  @IsOptional()
  requestId?: string;
}
