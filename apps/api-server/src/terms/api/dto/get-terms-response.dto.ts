import { ApiProperty } from '@nestjs/swagger';
import { TermsResultDto } from '../../application/dto/get-terms-result.dto';

export class TermsItemDto {
  @ApiProperty({
    description: '약관 ID',
    example: 1,
  })
  id!: number;

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
    description: '필수 동의 여부',
    example: true,
  })
  isRequired!: boolean;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
  })
  displayOrder!: number;

  private constructor(
    id: number,
    type: string,
    title: string,
    url: string | undefined,
    isRequired: boolean,
    displayOrder: number,
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.url = url;
    this.isRequired = isRequired;
    this.displayOrder = displayOrder;
  }

  public static of(
    id: number,
    type: string,
    title: string,
    url: string | undefined,
    isRequired: boolean,
    displayOrder: number,
  ): TermsItemDto {
    return new TermsItemDto(id, type, title, url, isRequired, displayOrder);
  }
}

export class GetTermsResponseDto {
  @ApiProperty({
    description: '약관 목록',
    type: [TermsItemDto],
  })
  terms!: TermsItemDto[];

  private constructor(terms: TermsItemDto[]) {
    this.terms = terms;
  }

  public static of(termsResults: TermsResultDto[]): GetTermsResponseDto {
    const termsItems = termsResults.map((result) =>
      TermsItemDto.of(
        result.id,
        result.type,
        result.title,
        result.url,
        result.isRequired,
        result.displayOrder,
      ),
    );
    return new GetTermsResponseDto(termsItems);
  }
}
