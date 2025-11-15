import { ApiProperty } from '@nestjs/swagger';
import { UpdatePopupCheckResultDto } from '../../application/dto/update-popup-check-result.dto';

export class CheckUpdatePopupResponseDto {
  @ApiProperty({
    description: '강제 업데이트 여부',
    example: false,
  })
  isForceUpdate: boolean;

  @ApiProperty({
    description: '팝업 노출 여부',
    example: true,
  })
  showPopup: boolean;

  @ApiProperty({
    description: '팝업 제목',
    example: '새로운 버전이 출시되었습니다',
  })
  title: string;

  @ApiProperty({
    description: '팝업 내용',
    example: '더 나은 경험을 위해 업데이트를 권장합니다.',
  })
  content: string;

  constructor(
    isForceUpdate: boolean,
    showPopup: boolean,
    title: string,
    content: string,
  ) {
    this.isForceUpdate = isForceUpdate;
    this.showPopup = showPopup;
    this.title = title;
    this.content = content;
  }

  static of(resultDto: UpdatePopupCheckResultDto): CheckUpdatePopupResponseDto {
    return new CheckUpdatePopupResponseDto(
      resultDto.isForceUpdate,
      resultDto.showPopup,
      resultDto.title,
      resultDto.content,
    );
  }
}
