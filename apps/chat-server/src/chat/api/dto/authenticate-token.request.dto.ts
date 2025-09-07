import { IsString, IsNotEmpty } from 'class-validator';

export class AuthenticateTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
