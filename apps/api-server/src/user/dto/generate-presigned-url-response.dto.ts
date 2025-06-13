import { PresignedUrlDto } from '@app/common/dto/presigned-url.dto';

export class GeneratePresignedUrlResponseDto extends PresignedUrlDto {
  static of(
    presignedUrl: string,
    key: string,
  ): GeneratePresignedUrlResponseDto {
    return new GeneratePresignedUrlResponseDto(presignedUrl, key);
  }
}
