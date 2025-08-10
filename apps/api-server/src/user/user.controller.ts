import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Get,
  Put,
  Query,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { S3Service } from '@app/common/s3/s3.service';
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
import { SaveInterestRegionsDto } from './dto/save-Interest-Regions.dto';
import { InterestRegionInfosDto } from './dto/inrerest-resion-info.dto';
import { CheckNicknameExistsDto } from './dto/check-nickname-exists.dto';
import { CheckNicknameExistsResponseDto } from './dto/check-nickname-exists-response.dto';
import { GeneratePresignedUrlRequestDto } from './dto/generate-presigned-url-request.dto';
import { GeneratePresignedUrlResponseDto } from './dto/generate-presigned-url-response.dto';
import { UserTokenInfo } from '../common/types/user-token-info';
import { GetUserTokenInfo } from '../common/decorators/get-user-token-info.decorator';
import { SaveInterestRegionDto } from './dto/save-interest-region.dto';
import { GetMyProfileResponseDto } from './dto/get-my-profile.response.dto';
import { GetUserProfileResponseDto } from './dto/get-user-profile.response.dto';

@ApiTags('유저')
@Controller({ path: 'users' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
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

  @Put('/regions')
  @ApiOperation({ summary: '관심지역 저장 API' })
  @ApiResponse({
    status: 204,
    description: '관심지역 저장 성공',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description:
      'code: U001(유저가 존재하지 않음), R001(지역이 존재하지 않음), IR001(기본 관심지역이 관심지역 목록에 없음)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async saveInterestRegions(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Body() saveInterestRegionsDto: SaveInterestRegionsDto,
  ): Promise<void> {
    await this.userService.saveInterestRegions(
      userTokenInfo.userId,
      saveInterestRegionsDto.regionIds,
      saveInterestRegionsDto.primaryRegionId,
    );
  }

  @Post('/regions/onboarding')
  @ApiOperation({
    summary: '온보딩 관심지역 설정 API',
    description:
      '온보딩 과정에서 첫 번째 관심지역을 설정하고 기본 관심지역으로 지정합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '온보딩 관심지역 설정 성공',
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponse,
    description: 'code: IR004(이미 관심지역이 존재함)',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'code: U001(유저가 존재하지 않음), R001(지역이 존재하지 않음)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async setOnboardingInterestRegion(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Body() saveInterestRegionDto: SaveInterestRegionDto,
  ): Promise<void> {
    await this.userService.setOnboardingInterestRegion(
      userTokenInfo.userId,
      saveInterestRegionDto.regionId,
    );
  }

  @Post('/regions')
  @ApiOperation({ summary: '개별 관심지역 저장 API' })
  @ApiResponse({
    status: 201,
    description: '개별 관심지역 저장 성공',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description:
      'code: R001(지역이 존재하지 않음), IR002(이미 관심지역으로 등록된 지역), IR003(관심지역 개수 초과)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async saveInterestRegion(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Body() saveInterestRegionDto: SaveInterestRegionDto,
  ): Promise<void> {
    await this.userService.saveInterestRegion(
      userTokenInfo.userId,
      saveInterestRegionDto.regionId,
    );
  }

  @Get('/regions')
  @ApiOperation({
    summary: '관심지역 리스트 조회 API (기본 관심지역 정보 포함)',
  })
  @ApiResponse({
    status: 200,
    description: '관심지역 리스트 조회 성공',
    type: InterestRegionInfosDto,
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
  async findInterestRegions(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
  ): Promise<InterestRegionInfosDto> {
    return this.userService.getInterestRegions(userTokenInfo.userId);
  }

  @Patch('/regions/:regionId/primary')
  @ApiOperation({ summary: '기본 관심지역 설정 API' })
  @ApiResponse({
    status: 204,
    description: '기본 관심지역 설정 성공',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description:
      'code: U001(유저가 존재하지 않음), IR001(유저의 관심지역 목록에 해당 지역이 존재하지 않음)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async setPrimaryInterestRegion(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Param('regionId') regionId: string,
  ): Promise<void> {
    await this.userService.setPrimaryInterestRegion(
      userTokenInfo.userId,
      regionId,
    );
  }

  @Delete('/regions/:regionId')
  @ApiOperation({ summary: '관심지역 삭제 API' })
  @ApiResponse({
    status: 204,
    description: '관심지역 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description:
      'code: U001(유저가 존재하지 않음), IR001(유저의 관심지역 목록에 해당 지역이 존재하지 않음), IR002(기본 관심지역은 삭제할 수 없음)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteInterestRegion(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Param('regionId') regionId: string,
  ): Promise<void> {
    await this.userService.deleteInterestRegion(userTokenInfo.userId, regionId);
  }

  @Post('/presigned-url')
  @ApiOperation({ summary: '프로필 이미지 업로드를 위한 Presigned URL 발급' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL 발급 성공',
    type: GeneratePresignedUrlResponseDto,
  })
  async generatePresignedUrl(
    @Body() generatePresignedUrlRequestDto: GeneratePresignedUrlRequestDto,
  ): Promise<GeneratePresignedUrlResponseDto> {
    const { presignedUrl, key } = await this.s3Service.generatePutPresignedUrl({
      fileName: generatePresignedUrlRequestDto.fileName,
      path: 'user',
    });

    return GeneratePresignedUrlResponseDto.of(presignedUrl, key);
  }

  @Get('/me')
  @ApiOperation({
    summary: '내 프로필 조회',
    description: '자기 자신의 프로필 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: GetMyProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'code: U001(유저가 존재하지 않음)',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
  ): Promise<GetMyProfileResponseDto> {
    const userProfile = await this.userService.getUserProfile(
      userTokenInfo.userId,
    );
    const interestRegions = await this.userService.getInterestRegions(
      userTokenInfo.userId,
    );

    return GetMyProfileResponseDto.of(
      userProfile.nickname,
      userProfile.profileImageKey,
      userProfile.university,
      interestRegions,
    );
  }

  @Get('/:userId')
  @ApiOperation({
    summary: '유저 프로필 조회',
    description: '다른 유저의 프로필 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: GetUserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'code: U001(유저가 존재하지 않음)',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GetUserProfileResponseDto> {
    const userProfileResult = await this.userService.getUserProfile(userId);

    return GetUserProfileResponseDto.of(
      userProfileResult.nickname,
      userProfileResult.profileImageKey,
      userProfileResult.university,
    );
  }
}
