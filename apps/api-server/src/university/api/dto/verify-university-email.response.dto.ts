import { ApiProperty } from '@nestjs/swagger';

export class VerifyUniversityEmailResponseDto {
  @ApiProperty({
    description: '인증된 대학교 ID',
    example: 1,
  })
  universityId: number;

  @ApiProperty({
    description: '인증된 대학교 이메일',
    example: 'student@snu.ac.kr',
  })
  universityEmail: string;

  static of(
    universityId: number,
    universityEmail: string,
  ): VerifyUniversityEmailResponseDto {
    const response = new VerifyUniversityEmailResponseDto();
    response.universityId = universityId;
    response.universityEmail = universityEmail;
    return response;
  }
}
