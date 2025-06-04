import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
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
} from '@app/database';
import { SignUpDto } from './dto/sign-up.dto';
import { SnsServiceFactory } from '../sns/sns.service.factory';
import { SignInDto } from './dto/sign-in.dto';
import { ErrorCode } from '../common/error-code';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';
import { CheckNicknameExistsDto } from './dto/check-nickname-exists.dto';
import { InterestRegionInfosDto } from './dto/inrerest-resion-info.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly snsServiceFactory: SnsServiceFactory,
    private readonly interestRegionRepository: InterestRegionRepository,
    private readonly regionRepository: RegionRepository,
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
    const { provider, providerId, oAuthToken, nickname, profileImageUrl } =
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
        profileImageUrl,
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

  @Transactional()
  async saveInterestRegions(
    userId: number,
    regionIds: string[],
  ): Promise<void> {
    // 유저 존재 여부 확인
    const user: User | null = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    // 모든 지역 ID가 유효한지 확인
    const regions = await this.regionRepository.findByIds(regionIds);
    if (regions.length !== regionIds.length) {
      throw new NotFoundException({
        code: ErrorCode.REGION_NOT_FOUND,
        message: '존재하지 않는 지역이 포함되어 있습니다.',
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
    regions.forEach((region) => {
      const interestRegion = this.interestRegionRepository.create({
        user,
        region,
      });
      this.interestRegionRepository.persist(interestRegion);
    });
  }
}
