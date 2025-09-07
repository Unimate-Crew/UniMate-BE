import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class JoinRoomRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  conversationId: number;

  @IsString()
  @IsOptional()
  requestId?: string;
}
