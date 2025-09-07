import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusRequestDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}
