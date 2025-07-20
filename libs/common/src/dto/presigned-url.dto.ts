import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlDto {
  @ApiProperty({
    description: 'S3에 파일을 업로드하기 위한 Presigned URL',
    example: 'https://example-bucket.s3.amazonaws.com/...',
  })
  presignedUrl: string;

  @ApiProperty({
    description: 'S3에 저장될 파일의 키',
    example: 'user/1752992559501-1234567890.jpg',
  })
  key: string;

  protected constructor(presignedUrl: string, key: string) {
    this.presignedUrl = presignedUrl;
    this.key = key;
  }

  static of(presignedUrl: string, key: string): PresignedUrlDto {
    return new PresignedUrlDto(presignedUrl, key);
  }
}
