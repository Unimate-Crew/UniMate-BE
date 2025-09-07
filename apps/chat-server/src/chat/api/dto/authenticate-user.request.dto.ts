import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AuthenticateUserRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  userId: number;
}
