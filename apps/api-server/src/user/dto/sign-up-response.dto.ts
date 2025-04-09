import { User } from '@app/database';
import { TokensDto } from '../../auth/dto/tokens.dto';

export class SignUpResponseDto {
  user: User;

  tokens: TokensDto;

  private constructor(user: User, tokens: TokensDto) {
    this.user = user;
    this.tokens = tokens;
  }

  static of(user: User, tokens: TokensDto): SignUpResponseDto {
    return new SignUpResponseDto(user, tokens);
  }
}
