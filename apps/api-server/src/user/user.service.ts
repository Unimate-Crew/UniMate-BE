import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import {
  User,
  UserRepository,
  OAuthProvider,
  InterestRegionRepository,
  InterestRegion,
  Region,
  RegionRepository,
  UniversityRepository,
  ReviewRepository,
  ReviewStatsDto,
} from '@app/database';
import { ErrorCode } from '@app/common';
import { S3Service } from '@app/common/s3/s3.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SnsServiceFactory } from '../sns/sns.service.factory';
import { SignInDto } from './dto/sign-in.dto';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';
import { CheckNicknameExistsDto } from './dto/check-nickname-exists.dto';
import { InterestRegionInfosDto } from './dto/inrerest-resion-info.dto';
import { GetUserProfileResultDto } from './dto/get-user-profile-result.dto';
import { UniversityInfoDto } from './dto/university-info.dto';
import { UpdateUserProfileResultDto } from './dto/update-user-profile-result.dto';
import { ReviewStatsResultDto } from './dto/review-stats-result.dto';

const INTEREST_REGIONS_MAX_COUNT = 3;

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly snsServiceFactory: SnsServiceFactory,
    private readonly interestRegionRepository: InterestRegionRepository,
    private readonly regionRepository: RegionRepository,
    private readonly universityRepository: UniversityRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  private async validateSnsUserInfo(
    provider: OAuthProvider,
    providerId: string,
    oAuthToken: string,
  ): Promise<void> {
    const snsService = this.snsServiceFactory.getService(provider);
    const snsUserInfo = await snsService.getUserInfo(oAuthToken);

    if (snsUserInfo.id !== providerId) {
      throw new UnauthorizedException({
        code: ErrorCode.SNS_USER_INFO_MISMATCH,
        message: 'Requested user ID does not match the authenticated user',
      });
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { provider, providerId, oAuthToken, nickname, profileImageKey } =
      signUpDto;

    await this.validateSnsUserInfo(provider, providerId, oAuthToken);

    let user: User | null = await this.userRepository.findByProviderId(
      provider,
      providerId,
    );

    if (!user) {
      user = this.userRepository.create({
        provider,
        providerId,
        nickname,
        profileImageKey,
      });
      await this.userRepository.flush();
    }

    return user;
  }

  async signIn(signInDto: SignInDto): Promise<User> {
    const { provider, providerId, oAuthToken } = signInDto;

    await this.validateSnsUserInfo(provider, providerId, oAuthToken);

    const user = await this.userRepository.findByProviderId(
      provider,
      providerId,
    );

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return user;
  }

  async checkUserExists(
    checkUserExistsDto: CheckUserExistsDto,
  ): Promise<boolean> {
    const { provider, providerId, oAuthToken } = checkUserExistsDto;

    await this.validateSnsUserInfo(provider, providerId, oAuthToken);

    const user = await this.userRepository.findByProviderId(
      provider,
      providerId,
    );

    return !!user;
  }

  async checkNicknameExists(
    checkNicknameExistsDto: CheckNicknameExistsDto,
  ): Promise<boolean> {
    const { nickname } = checkNicknameExistsDto;
    const user = await this.userRepository.findByNickname(nickname);

    return !!user;
  }

  async getInterestRegions(userId: number): Promise<InterestRegionInfosDto> {
    const interestRegions: InterestRegion[] =
      await this.interestRegionRepository.findWithRegionByUserId(userId);

    return InterestRegionInfosDto.of(interestRegions);
  }

  async getUserProfile(userId: number): Promise<GetUserProfileResultDto> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    let university: UniversityInfoDto | undefined;

    if (user.getUniversityId()) {
      const universityEntity = await this.universityRepository.findOne(
        user.getUniversityId()!,
      );
      if (universityEntity) {
        university = UniversityInfoDto.of(
          universityEntity.getId(),
          universityEntity.getName(),
          universityEntity.getDomain(),
          universityEntity.getCountry(),
        );
      }
    }

    const reviewStats: ReviewStatsDto =
      await this.reviewRepository.getReviewStatsByRevieweeId(userId);

    const reviewStatsResult: ReviewStatsResultDto = ReviewStatsResultDto.of(
      reviewStats.averageRating,
      reviewStats.totalReviews,
    );

    // profileImageKey를 profileImageUrl로 변환
    let profileImageUrl: string | undefined;
    const profileImageKey = user.getProfileImageKey();
    if (profileImageKey) {
      profileImageUrl =
        await this.s3Service.generateGetPresignedUrl(profileImageKey);
    }

    return GetUserProfileResultDto.of(
      user.getNickname(),
      profileImageUrl,
      university,
      reviewStatsResult,
    );
  }

  @Transactional()
  async saveInterestRegions(
    userId: number,
    regionIds: string[],
    primaryRegionId?: string,
  ): Promise<void> {
    // 모든 지역 ID가 유효한지 확인
    const regions: Region[] = await this.regionRepository.findByIds(regionIds);
    if (regions.length !== regionIds.length) {
      throw new NotFoundException({
        code: ErrorCode.REGION_NOT_FOUND,
        message: '존재하지 않는 지역이 포함되어 있습니다.',
      });
    }

    // 기본 관심지역이 관심지역 목록에 포함되어 있는지 확인
    if (primaryRegionId && !regionIds.includes(primaryRegionId)) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_NOT_FOUND,
        message: '기본 관심지역은 관심지역 목록에 포함되어 있어야 합니다.',
      });
    }

    // 기존 관심 지역들을 조회
    const existingInterestRegions: InterestRegion[] =
      await this.interestRegionRepository.findByUserId(userId);

    // 기존 관심 지역들을 논리적으로 삭제 처리
    existingInterestRegions.forEach((interestRegion) => {
      interestRegion.delete();
      this.interestRegionRepository.persist(interestRegion);
    });

    // 새로운 관심 지역 생성
    regionIds.forEach((regionId) => {
      const interestRegion = this.interestRegionRepository.create({
        user: userId,
        region: regionId,
        isPrimary: primaryRegionId ? regionId === primaryRegionId : false,
      });
      this.interestRegionRepository.persist(interestRegion);
    });
  }

  @Transactional()
  async setPrimaryInterestRegion(
    userId: number,
    regionId: string,
  ): Promise<void> {
    // 해당 지역이 유저의 관심 지역 목록에 있는지 확인
    const targetInterestRegion: InterestRegion | null =
      await this.interestRegionRepository.findByUserIdAndRegionId(
        userId,
        regionId,
      );

    if (!targetInterestRegion) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_NOT_FOUND,
        message: '해당 지역이 관심 지역 목록에 존재하지 않습니다.',
      });
    }

    // 기존 기본 관심 지역이 있다면 해제
    const currentPrimaryRegion: InterestRegion | null =
      await this.interestRegionRepository.findPrimaryByUserId(userId);
    if (currentPrimaryRegion) {
      currentPrimaryRegion.setPrimary(false);
      this.interestRegionRepository.persist(currentPrimaryRegion);
    }

    // 새로운 기본 관심 지역 설정
    targetInterestRegion.setPrimary(true);
    this.interestRegionRepository.persist(targetInterestRegion);
  }

  @Transactional()
  async deleteInterestRegion(userId: number, regionId: string): Promise<void> {
    // 해당 지역이 유저의 관심 지역 목록에 있는지 확인
    const targetInterestRegion: InterestRegion | null =
      await this.interestRegionRepository.findByUserIdAndRegionId(
        userId,
        regionId,
      );

    if (!targetInterestRegion) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_NOT_FOUND,
        message: '해당 지역이 관심 지역 목록에 존재하지 않습니다.',
      });
    }

    // 삭제할 지역이 기본 관심지역인 경우 삭제 불가
    if (targetInterestRegion.getIsPrimary()) {
      throw new NotFoundException({
        code: ErrorCode.PRIMARY_INTEREST_REGION_CANNOT_BE_DELETED,
        message:
          '기본 관심지역은 삭제할 수 없습니다. 다른 지역을 기본으로 설정한 후 삭제해주세요.',
      });
    }

    // 관심지역 삭제 (논리적 삭제)
    targetInterestRegion.delete();
    this.interestRegionRepository.persist(targetInterestRegion);
  }

  async setOnboardingInterestRegion(
    userId: number,
    regionId: string,
  ): Promise<void> {
    // 유저가 존재하는지 확인
    const user: User | null = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '존재하지 않는 유저입니다.',
      });
    }

    // 지역 ID가 유효한지 확인
    const region: Region | null = await this.regionRepository.findOne(regionId);

    if (!region) {
      throw new NotFoundException({
        code: ErrorCode.REGION_NOT_FOUND,
        message: '존재하지 않는 지역입니다.',
      });
    }

    // 현재 관심지역이 이미 존재하는지 확인
    const currentInterestRegions: InterestRegion[] =
      await this.interestRegionRepository.findByUserId(userId);

    if (currentInterestRegions.length > 0) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_ALREADY_EXISTS,
        message:
          '이미 관심지역이 존재합니다. 온보딩 API는 첫 번째 관심지역 설정에만 사용할 수 있습니다.',
      });
    }

    // 온보딩용 관심지역 생성 (기본 관심지역으로 설정)
    this.interestRegionRepository.create({
      user: userId,
      region: regionId,
      isPrimary: true,
    });
    await this.interestRegionRepository.flush();
  }

  async saveInterestRegion(userId: number, regionId: string): Promise<void> {
    // 지역 ID가 유효한지 확인
    const region: Region | null = await this.regionRepository.findOne(regionId);

    if (!region) {
      throw new NotFoundException({
        code: ErrorCode.REGION_NOT_FOUND,
        message: '존재하지 않는 지역입니다.',
      });
    }

    // 현재 관심지역 개수 확인 및 중복 등록 확인 (최대 3개 제한)
    const currentInterestRegions: InterestRegion[] =
      await this.interestRegionRepository.findByUserId(userId);

    // 중복 등록 확인 (조회된 결과에서 확인)
    const existingInterestRegion = currentInterestRegions.find(
      (interestRegion) => interestRegion.getRegion().getId() === regionId,
    );

    if (existingInterestRegion) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_ALREADY_EXISTS,
        message: '이미 관심지역으로 등록된 지역입니다.',
      });
    }

    // 개수 제한 확인
    if (currentInterestRegions.length >= INTEREST_REGIONS_MAX_COUNT) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_LIMIT_EXCEEDED,
        message: `관심지역은 최대 ${INTEREST_REGIONS_MAX_COUNT}개까지 등록할 수 있습니다.`,
      });
    }

    // 새로운 관심지역 생성
    this.interestRegionRepository.create({
      user: userId,
      region: regionId,
      isPrimary: false,
    });
    await this.interestRegionRepository.flush();
  }

  async updateUserProfile(params: {
    userId: number;
    nickname?: string;
    profileImageKey?: string;
  }): Promise<UpdateUserProfileResultDto> {
    const { userId, nickname, profileImageKey } = params;

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    // 닉네임 중복 검사 (닉네임이 변경되는 경우에만)
    if (nickname && nickname !== user.getNickname()) {
      const existingUser = await this.userRepository.findByNickname(nickname);
      if (existingUser && existingUser.getId() !== userId) {
        throw new BadRequestException({
          code: ErrorCode.NICKNAME_ALREADY_EXISTS,
          message: '이미 사용 중인 닉네임입니다.',
        });
      }
    }

    // 유저 정보 업데이트
    if (nickname) {
      user.setNickname(nickname);
    }
    if (profileImageKey) {
      user.setProfileImageKey(profileImageKey);
    }

    this.userRepository.persist(user);
    await this.userRepository.flush();

    return UpdateUserProfileResultDto.from(user);
  }
}
