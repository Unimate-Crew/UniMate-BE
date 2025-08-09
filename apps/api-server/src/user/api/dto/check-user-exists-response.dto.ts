import { ApiProperty } from '@nestjs/swagger';

export class CheckUserExistsResponseDto {
  @ApiProperty({
    description: '유저 존재 여부',
    example: true,
  })
  exists: boolean;

  private constructor(exists: boolean) {
    this.exists = exists;
  }

  static of(exists: boolean): CheckUserExistsResponseDto {
    return new CheckUserExistsResponseDto(exists);
  }
}
