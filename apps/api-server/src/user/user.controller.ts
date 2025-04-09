import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from '../auth/auth.service';
import { SignUpResponseDto } from './dto/sign-up-response.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const user = await this.userService.signUp(signUpDto);
    const tokens = await this.authService.generateTokens(user);

    return SignUpResponseDto.of(user, tokens);
  }
}
