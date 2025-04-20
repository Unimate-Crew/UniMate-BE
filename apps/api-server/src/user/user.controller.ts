import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from '../auth/auth.service';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';
import { CheckUserExistsResponseDto } from './dto/check-user-exists-response.dto';

@ApiTags('유저')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: '회원가입',
    description: '새로운 유저를 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: SignUpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const user = await this.userService.signUp(signUpDto);
    const tokens = await this.authService.generateTokens(user);

    return SignUpResponseDto.of(tokens);
  }

  @ApiOperation({
    summary: '로그인',
    description: '유저 로그인을 처리합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: SignInResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    const user = await this.userService.signIn(signInDto);
    const token = await this.authService.generateAccessToken(
      user.getId(),
      user.getProvider(),
    );

    return SignInResponseDto.of(token);
  }

  @ApiOperation({
    summary: '유저 존재 여부 확인',
    description: '해당 SNS 계정으로 가입된 유저가 있는지 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저 존재 여부 확인 성공',
    type: CheckUserExistsResponseDto,
  })
  @Post('exists')
  async checkUserExists(
    @Body() checkUserExistsDto: CheckUserExistsDto,
  ): Promise<CheckUserExistsResponseDto> {
    const exists = await this.userService.checkUserExists(checkUserExistsDto);

    return CheckUserExistsResponseDto.of(exists);
  }
}
