import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
  Get,
  Put,
  Query,
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
import { SetPrimaryInterestCityDto } from './dto/set-primary-interest-city.dto';
import { CheckNicknameExistsDto } from './dto/check-nickname-exists.dto';
import { CheckNicknameExistsResponseDto } from './dto/check-nickname-exists-response.dto';

@ApiTags('유저')
@Controller({
  path: 'users',
  version: '1',
})
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

  @Get('nickname/exists')
  @ApiOperation({
    summary: '닉네임 중복 검사',
    description: '해당 닉네임이 이미 사용 중인지 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '닉네임 중복 검사 성공',
    type: CheckNicknameExistsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '닉네임에 특수문자나 공백이 포함되어 있습니다.',
  })
  async checkNicknameExists(
    @Query() checkNicknameExistsDto: CheckNicknameExistsDto,
  ): Promise<CheckNicknameExistsResponseDto> {
    const exists = await this.userService.checkNicknameExists(
      checkNicknameExistsDto,
    );
    return CheckNicknameExistsResponseDto.of(exists);
  }

  @Put('/cities')
  @ApiOperation({ summary: '관심도시 저장 API' })
  @ApiResponse({
    status: 204,
    description: '관심도시 저장 성공',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'code: U001(유저가 존재하지 않음), C001(도시가 존재하지 않음)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async saveInterestCities(
    @Req() req: Request,
    @Body() saveInterestCitiesDto: SaveInterestCitiesDto,
  ): Promise<any> {
    const userId = (req.user as User).getId();
    // await this.userService.saveCities(userId, saveCitiesDto.cityIds);
  }

  @Get('/cities')
  @ApiOperation({
    summary: '관심도시 리스트 조회 API (기본 관심도시 정보 포함)',
  })
  @ApiResponse({
    status: 200,
    description: '관심도시 리스트 조회 성공',
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
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async findInterestCities(
    @Req() req: Request,
  ): Promise<FindInterestCitiesResponseDto> {
    const userId = (req.user as User).getId();
    // 실제 구현 시에는 이 주석을 제거하고 서비스 메서드를 호출합니다.
    // const cities = await this.userService.getInterestCities(userId);

    // 임시 응답 데이터
    return FindInterestCitiesResponseDto.of([
      { id: 1, name: 'New York', isPrimary: true },
      { id: 2, name: 'Los Angeles', isPrimary: false },
      { id: 3, name: 'Chicago', isPrimary: false },
    ]);
  }

  @Put('/cities/primary')
  @ApiOperation({ summary: '기본 관심도시 설정 API' })
  @ApiResponse({
    status: 204,
    description: '기본 관심도시 설정 성공',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description:
      'code: U001(유저가 존재하지 않음), C001(도시가 존재하지 않음), IC001(유저의 관심도시 목록에 해당 도시가 존재하지 않음)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async setPrimaryInterestCity(
    @Req() req: Request,
    @Body() setPrimaryInterestCityDto: SetPrimaryInterestCityDto,
  ): Promise<void> {
    const userId = (req.user as User).getId();
    // 실제 구현 시에는 이 주석을 제거하고 서비스 메서드를 호출합니다.
    // await this.userService.setPrimaryInterestCity(userId, setPrimaryInterestCityDto.cityId);
  }
}
