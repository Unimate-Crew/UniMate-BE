import { ApiProperty } from '@nestjs/swagger';

export class CheckNicknameExistsResponseDto {
  @ApiProperty({
    description: '닉네임 중복 여부',
    example: true,
  })
  exists: boolean;

  private constructor(exists: boolean) {
    this.exists = exists;
  }

  static of(exists: boolean): CheckNicknameExistsResponseDto {
    return new CheckNicknameExistsResponseDto(exists);
  }
}
