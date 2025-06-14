import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMaxSize } from 'class-validator';
import { GeneratePresignedUrlParam } from '../../application/dto/generate-presigned-url.param';

export class GeneratePresignedUrlListRequestDto {
  @ApiProperty({
    description: '업로드할 파일들의 이름 배열 (최대 10개)',
    example: ['product1.jpg', 'product2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  fileNames: string[];

  toParam(): GeneratePresignedUrlParam {
    const param = new GeneratePresignedUrlParam();
    param.fileNames = this.fileNames;
    return param;
  }
}
