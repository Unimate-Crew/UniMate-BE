import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class JoinRoomRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  conversationId: number;
}
