import { User } from '@app/database/entites/user/user.entity';

export class SignUpResultDto extends User {
  static of(user: User): SignUpResultDto {
    return user as SignUpResultDto;
  }
}
