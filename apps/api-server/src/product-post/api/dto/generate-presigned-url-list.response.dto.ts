import { ApiProperty } from '@nestjs/swagger';
import { PresignedUrlDto } from '@app/common/dto/presigned-url.dto';

export class GeneratePresignedUrlListResponseDto {
  @ApiProperty({
    description: 'Presigned URL 목록',
    type: [PresignedUrlDto],
  })
  urlList: PresignedUrlDto[];

  private constructor(urlList: PresignedUrlDto[]) {
    this.urlList = urlList;
  }

  static of(urlList: PresignedUrlDto[]): GeneratePresignedUrlListResponseDto {
    return new GeneratePresignedUrlListResponseDto(urlList);
  }
}
