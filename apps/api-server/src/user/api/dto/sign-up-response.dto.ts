import { ApiProperty } from '@nestjs/swagger';
import { TokensDto } from '../../auth/dto/tokens.dto';

export class SignUpResponseDto {
  @ApiProperty({
    description: '발급된 토큰 정보',
    type: TokensDto,
  })
  tokens: TokensDto;

  private constructor(tokens: TokensDto) {
    this.tokens = tokens;
  }

  static of(tokens: TokensDto): SignUpResponseDto {
    return new SignUpResponseDto(tokens);
  }
}
