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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { S3Service } from '@app/common/s3/s3.service';
import { UserService } from '../application/user.service';
import { AuthService } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ErrorResponse } from '../../common/error-response';
import { UserTokenInfo } from '../../common/types/user-token-info';
import { GetUserTokenInfo } from '../../common/decorators/get-user-token-info.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';
import { CheckUserExistsResponseDto } from './dto/check-user-exists-response.dto';
import { CheckNicknameExistsDto } from './dto/check-nickname-exists.dto';
import { CheckNicknameExistsResponseDto } from './dto/check-nickname-exists-response.dto';
import { SaveInterestRegionsDto } from './dto/save-Interest-Regions.dto';
import { SaveInterestRegionDto } from './dto/save-interest-region.dto';
import { GeneratePresignedUrlRequestDto } from './dto/generate-presigned-url-request.dto';
import { GeneratePresignedUrlResponseDto } from './dto/generate-presigned-url-response.dto';
import { SignUpParamsDto } from '../application/dto/sign-up-params.dto';
import { SignUpResultDto } from '../application/dto/sign-up-result.dto';
import { SignInParamsDto } from '../application/dto/sign-in-params.dto';
import { SignInResultDto } from '../application/dto/sign-in-result.dto';
import { CheckUserExistsParamsDto } from '../application/dto/check-user-exists-params.dto';
import { CheckUserExistsResultDto } from '../application/dto/check-user-exists-result.dto';
import { CheckNicknameExistsParamsDto } from '../application/dto/check-nickname-exists-params.dto';
import { CheckNicknameExistsResultDto } from '../application/dto/check-nickname-exists-result.dto';
import { SaveInterestRegionsParamsDto } from '../application/dto/save-interest-regions-params.dto';
import { SaveInterestRegionParamsDto } from '../application/dto/save-interest-region-params.dto';
import { SetPrimaryInterestRegionParamsDto } from '../application/dto/set-primary-interest-region-params.dto';
import { DeleteInterestRegionParamsDto } from '../application/dto/delete-interest-region-params.dto';
import { InterestRegionInfosDto } from './dto/inrerest-resion-info.dto';

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
  async signUp(@Body() requestDto: SignUpDto): Promise<SignUpResponseDto> {
    const params: SignUpParamsDto = SignUpParamsDto.of(
      requestDto.provider,
      requestDto.providerId,
      requestDto.oAuthToken,
      requestDto.nickname,
      requestDto.profileImageKey,
    );
    const result: SignUpResultDto = await this.userService.signUp(params);
    const tokens = await this.authService.generateTokens(result);

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
  async signIn(@Body() requestDto: SignInDto): Promise<SignInResponseDto> {
    const params: SignInParamsDto = SignInParamsDto.of(
      requestDto.provider,
      requestDto.providerId,
      requestDto.oAuthToken,
    );
    const result: SignInResultDto = await this.userService.signIn(params);
    const token = await this.authService.generateAccessToken(
      result.getId(),
      result.getProvider(),
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
    @Body() requestDto: CheckUserExistsDto,
  ): Promise<CheckUserExistsResponseDto> {
    const params: CheckUserExistsParamsDto = CheckUserExistsParamsDto.of(
      requestDto.provider,
      requestDto.providerId,
    );
    const result: CheckUserExistsResultDto =
      await this.userService.checkUserExists(params);

    return CheckUserExistsResponseDto.of(result.exists);
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
    @Query() requestDto: CheckNicknameExistsDto,
  ): Promise<CheckNicknameExistsResponseDto> {
    const params: CheckNicknameExistsParamsDto =
      CheckNicknameExistsParamsDto.of(requestDto.nickname);
    const result: CheckNicknameExistsResultDto =
      await this.userService.checkNicknameExists(params);
    return CheckNicknameExistsResponseDto.of(result.exists);
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
    @Body() requestDto: SaveInterestRegionsDto,
  ): Promise<void> {
    const params: SaveInterestRegionsParamsDto =
      SaveInterestRegionsParamsDto.of(
        userTokenInfo.userId,
        requestDto.regionIds,
        requestDto.primaryRegionId,
      );
    await this.userService.saveInterestRegions(params);
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
    @Body() requestDto: SaveInterestRegionDto,
  ): Promise<void> {
    const params: SaveInterestRegionParamsDto = SaveInterestRegionParamsDto.of(
      userTokenInfo.userId,
      requestDto.regionId,
    );
    await this.userService.saveInterestRegion(params);
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
    const result = await this.userService.getInterestRegions(
      userTokenInfo.userId,
    );
    return result;
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
    const params: SetPrimaryInterestRegionParamsDto =
      SetPrimaryInterestRegionParamsDto.of(userTokenInfo.userId, regionId);
    await this.userService.setPrimaryInterestRegion(params);
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
    const params: DeleteInterestRegionParamsDto =
      DeleteInterestRegionParamsDto.of(userTokenInfo.userId, regionId);
    await this.userService.deleteInterestRegion(params);
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
}
