import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GeneratePresignedUrlRequestDto {
  @ApiProperty({
    description: '업로드할 파일의 이름',
    example: 'profile.jpg',
  })
  @IsNotEmpty()
  @IsString()
  fileName: string;
}
