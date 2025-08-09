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
import { SnsServiceFactory } from '../../sns/application/sns.service.factory';
import { ErrorCode } from '../../common/error-code';
import { SignUpParamsDto } from './dto/sign-up-params.dto';
import { SignUpResultDto } from './dto/sign-up-result.dto';
import { SignInParamsDto } from './dto/sign-in-params.dto';
import { SignInResultDto } from './dto/sign-in-result.dto';
import { CheckUserExistsParamsDto } from './dto/check-user-exists-params.dto';
import { CheckUserExistsResultDto } from './dto/check-user-exists-result.dto';
import { CheckNicknameExistsParamsDto } from './dto/check-nickname-exists-params.dto';
import { CheckNicknameExistsResultDto } from './dto/check-nickname-exists-result.dto';
import { GetInterestRegionsResultDto } from './dto/get-interest-regions-result.dto';
import { SaveInterestRegionsParamsDto } from './dto/save-interest-regions-params.dto';
import { SetPrimaryInterestRegionParamsDto } from './dto/set-primary-interest-region-params.dto';
import { DeleteInterestRegionParamsDto } from './dto/delete-interest-region-params.dto';
import { SaveInterestRegionParamsDto } from './dto/save-interest-region-params.dto';
import { InterestRegionInfosDto } from '../api/dto/inrerest-resion-info.dto';

const INTEREST_REGIONS_MAX_COUNT = 3;

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

  async signUp(params: SignUpParamsDto): Promise<SignUpResultDto> {
    await this.validateSnsUserInfo(
      params.provider,
      params.providerId,
      params.oAuthToken,
    );

    let user: User | null = await this.userRepository.findByProviderId(
      params.provider,
      params.providerId,
    );

    if (!user) {
      user = this.userRepository.create({
        provider: params.provider,
        providerId: params.providerId,
        nickname: params.nickname,
        profileImageKey: params.profileImageKey,
      });
      await this.userRepository.flush();
    }

    return SignUpResultDto.of(user);
  }

  async signIn(params: SignInParamsDto): Promise<SignInResultDto> {
    await this.validateSnsUserInfo(
      params.provider,
      params.providerId,
      params.oAuthToken,
    );

    const user = await this.userRepository.findByProviderId(
      params.provider,
      params.providerId,
    );

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return SignInResultDto.of(user);
  }

  async checkUserExists(
    params: CheckUserExistsParamsDto,
  ): Promise<CheckUserExistsResultDto> {
    const user = await this.userRepository.findByProviderId(
      params.provider,
      params.providerId,
    );

    return CheckUserExistsResultDto.of(!!user);
  }

  async checkNicknameExists(
    params: CheckNicknameExistsParamsDto,
  ): Promise<CheckNicknameExistsResultDto> {
    const user = await this.userRepository.findByNickname(params.nickname);

    return CheckNicknameExistsResultDto.of(!!user);
  }

  async getInterestRegions(
    userId: number,
  ): Promise<GetInterestRegionsResultDto> {
    const interestRegions: InterestRegion[] =
      await this.interestRegionRepository.findWithRegionByUserId(userId);

    const interestRegionInfos = InterestRegionInfosDto.of(interestRegions);
    return GetInterestRegionsResultDto.of(interestRegionInfos);
  }

  @Transactional()
  async saveInterestRegions(
    params: SaveInterestRegionsParamsDto,
  ): Promise<void> {
    // 모든 지역 ID가 유효한지 확인
    const regions: Region[] = await this.regionRepository.findByIds(
      params.regionIds,
    );
    if (regions.length !== params.regionIds.length) {
      throw new NotFoundException({
        code: ErrorCode.REGION_NOT_FOUND,
        message: '존재하지 않는 지역이 포함되어 있습니다.',
      });
    }

    // 기본 관심지역이 관심지역 목록에 포함되어 있는지 확인
    if (
      params.primaryRegionId &&
      !params.regionIds.includes(params.primaryRegionId)
    ) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_NOT_FOUND,
        message: '기본 관심지역은 관심지역 목록에 포함되어 있어야 합니다.',
      });
    }

    // 기존 관심 지역들을 조회
    const existingInterestRegions: InterestRegion[] =
      await this.interestRegionRepository.findByUserId(params.userId);

    // 기존 관심 지역들을 논리적으로 삭제 처리
    existingInterestRegions.forEach((interestRegion) => {
      interestRegion.delete();
      this.interestRegionRepository.persist(interestRegion);
    });

    // 새로운 관심 지역 생성
    params.regionIds.forEach((regionId) => {
      const interestRegion = this.interestRegionRepository.create({
        user: params.userId,
        region: regionId,
        isPrimary: params.primaryRegionId
          ? regionId === params.primaryRegionId
          : false,
      });
      this.interestRegionRepository.persist(interestRegion);
    });
  }

  @Transactional()
  async setPrimaryInterestRegion(
    params: SetPrimaryInterestRegionParamsDto,
  ): Promise<void> {
    // 해당 지역이 유저의 관심 지역 목록에 있는지 확인
    const targetInterestRegion: InterestRegion | null =
      await this.interestRegionRepository.findByUserIdAndRegionId(
        params.userId,
        params.regionId,
      );

    if (!targetInterestRegion) {
      throw new NotFoundException({
        code: ErrorCode.INTEREST_REGION_NOT_FOUND,
        message: '해당 지역이 관심 지역 목록에 존재하지 않습니다.',
      });
    }

    // 기존 기본 관심 지역이 있다면 해제
    const currentPrimaryRegion: InterestRegion | null =
      await this.interestRegionRepository.findPrimaryByUserId(params.userId);
    if (currentPrimaryRegion) {
      currentPrimaryRegion.setPrimary(false);
      this.interestRegionRepository.persist(currentPrimaryRegion);
    }

    // 새로운 기본 관심 지역 설정
    targetInterestRegion.setPrimary(true);
    this.interestRegionRepository.persist(targetInterestRegion);
  }

  @Transactional()
  async deleteInterestRegion(
    params: DeleteInterestRegionParamsDto,
  ): Promise<void> {
    // 해당 지역이 유저의 관심 지역 목록에 있는지 확인
    const targetInterestRegion: InterestRegion | null =
      await this.interestRegionRepository.findByUserIdAndRegionId(
        params.userId,
        params.regionId,
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

  async saveInterestRegion(params: SaveInterestRegionParamsDto): Promise<void> {
    // 지역 ID가 유효한지 확인
    const region: Region | null = await this.regionRepository.findOne(
      params.regionId,
    );

    if (!region) {
      throw new NotFoundException({
        code: ErrorCode.REGION_NOT_FOUND,
        message: '존재하지 않는 지역입니다.',
      });
    }

    // 현재 관심지역 개수 확인 및 중복 등록 확인 (최대 3개 제한)
    const currentInterestRegions: InterestRegion[] =
      await this.interestRegionRepository.findByUserId(params.userId);

    // 중복 등록 확인 (조회된 결과에서 확인)
    const existingInterestRegion = currentInterestRegions.find(
      (interestRegion) =>
        interestRegion.getRegion().getId() === params.regionId,
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
    const interestRegion = this.interestRegionRepository.create({
      user: params.userId,
      region: params.regionId,
      isPrimary: false,
    });
    this.interestRegionRepository.persist(interestRegion);
  }
}
