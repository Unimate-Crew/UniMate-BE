import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  conversationId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  requestId?: string;
}
