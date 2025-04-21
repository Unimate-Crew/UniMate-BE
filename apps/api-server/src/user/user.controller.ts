import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@app/database';
import { UserService } from './user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from '../auth/auth.service';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';
import { CheckUserExistsResponseDto } from './dto/check-user-exists-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorResponse } from '../common/error-response';
import { SaveInterestCitiesDto } from './dto/save-Interest-Cities.dto';
import { FindInterestCitiesResponseDto } from './dto/find-interest-cities-response.dto';

@ApiTags('유저')
@ApiBearerAuth()
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

  @Post('/cities')
  @ApiOperation({ summary: '관심도시 저장 API' })
  @ApiResponse({
    status: 204,
    description: '관심도시 저장 성공',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description:
      'code는 U001(유저가 존재하지 않음), C001(도시가 존재하지 않음)이 나올 수 있음.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async saveInterestCities(
    @Req() req: Request,
    @Body() saveInterestCitiesDto: SaveInterestCitiesDto,
  ): Promise<void> {
    const userId = (req.user as User).getId();
    // await this.userService.saveCities(userId, saveCitiesDto.cityIds);
  }

  @Get('/cities')
  @ApiOperation({ summary: '관심도시 조회 API' })
  @ApiResponse({
    status: 200,
    description: '관심도시 조회 성공',
    type: FindInterestCitiesResponseDto,
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'code는 U001(유저가 존재하지 않음)이 나올 수 있음.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @UseGuards(JwtAuthGuard)
  async findInterestCities(
    @Req() req: Request,
  ): Promise<FindInterestCitiesResponseDto> {
    const userId = (req.user as User).getId();
    // const cities = await this.userService.getInterestCities(userId);

    return FindInterestCitiesResponseDto.of([
      { id: 1, name: 'New York' },
      { id: 2, name: 'Los Angeles' },
      { id: 3, name: 'Chicago' },
    ]);
  }
}
