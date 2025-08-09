import { User } from '@app/database/entites/user/user.entity';

export class SignInResultDto extends User {
  static of(user: User): SignInResultDto {
    return user as SignInResultDto;
  }
}
