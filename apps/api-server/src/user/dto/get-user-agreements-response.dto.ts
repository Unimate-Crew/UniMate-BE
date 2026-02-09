import { ApiProperty } from '@nestjs/swagger';
import { UserAgreementResultDto } from './get-user-agreements-result.dto';

export class AgreementItemDto {
  @ApiProperty({
    description: '약관 ID',
    example: 1,
  })
  termsId!: number;

  @ApiProperty({
    description: '약관 타입',
    enum: ['AGE_VERIFICATION', 'SERVICE_TERMS', 'PRIVACY_POLICY'],
    example: 'SERVICE_TERMS',
  })
  type!: string;

  @ApiProperty({
    description: '약관 제목',
    example: '유니메이트 이용약관 동의',
  })
  title!: string;

  @ApiProperty({
    description: '약관 URL',
    example: 'https://unimate.com/terms',
    required: false,
  })
  url?: string;

  @ApiProperty({
    description: '동의 시각',
    example: '2025-01-15T10:30:00Z',
  })
  agreedAt!: Date;

  private constructor(
    termsId: number,
    type: string,
    title: string,
    url: string | undefined,
    agreedAt: Date,
  ) {
    this.termsId = termsId;
    this.type = type;
    this.title = title;
    this.url = url;
    this.agreedAt = agreedAt;
  }

  public static of(
    termsId: number,
    type: string,
    title: string,
    url: string | undefined,
    agreedAt: Date,
  ): AgreementItemDto {
    return new AgreementItemDto(termsId, type, title, url, agreedAt);
  }
}

export class GetUserAgreementsResponseDto {
  @ApiProperty({
    description: '사용자 동의 이력',
    type: [AgreementItemDto],
  })
  agreements!: AgreementItemDto[];

  private constructor(agreements: AgreementItemDto[]) {
    this.agreements = agreements;
  }

  public static of(
    agreementsResult: UserAgreementResultDto[],
  ): GetUserAgreementsResponseDto {
    const agreementItems = agreementsResult.map((result) =>
      AgreementItemDto.of(
        result.termsId,
        result.type,
        result.title,
        result.url,
        result.agreedAt,
      ),
    );
    return new GetUserAgreementsResponseDto(agreementItems);
  }
}
