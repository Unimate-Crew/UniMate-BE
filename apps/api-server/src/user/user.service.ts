import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  User,
  UserRepository,
  OAuthProvider,
  InterestRegionRepository,
  RegionRepository,
  InterestRegion,
} from '@app/database';
import { InterestRegionWithRegion } from '@app/database/entites/interest-region/dto/interest-region-wiht-region';
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

  async saveRegions(userId: number, regionIds: string[]): Promise<void> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '사용자를 찾을 수 없습니다',
      });
    }

    // 관심도시 정보 저장 로직 구현
    // TODO: 실제 사용자와 도시 간의 관계를 저장하는 로직 구현 필요
    // 현재는 메서드만 정의하고 실제 구현은 추후 필요에 따라 작성
  }

  async getInterestRegions(userId: number): Promise<InterestRegionInfosDto> {
    const interestRegionWithRegions: InterestRegionWithRegion[] =
      await this.interestRegionRepository.findWithRegionByUserId(userId);

    return InterestRegionInfosDto.of(interestRegionWithRegions);
  }
}
