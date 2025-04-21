import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRepository, AuthProvider } from '@app/database';
import { SignUpDto } from './dto/sign-up.dto';
import { SnsServiceFactory } from '../sns/sns.service.factory';
import { SignInDto } from './dto/sign-in.dto';
import { ErrorCode } from '../common/error-code';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly snsServiceFactory: SnsServiceFactory,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  private async validateSnsUserInfo(
    provider: AuthProvider,
    providerId: string,
    accessToken: string,
  ): Promise<void> {
    const snsService = this.snsServiceFactory.getService(provider);
    const snsUserInfo = await snsService.getUserInfo(accessToken);

    if (snsUserInfo.id !== providerId) {
      throw new UnauthorizedException({
        code: ErrorCode.SNS_USER_INFO_MISMATCH,
        message: 'Requested user ID does not match the authenticated user',
      });
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { provider, providerId, accessToken, nickname, profileImageUrl } =
      signUpDto;

    await this.validateSnsUserInfo(provider, providerId, accessToken);

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
    const { provider, providerId, accessToken } = signInDto;

    await this.validateSnsUserInfo(provider, providerId, accessToken);

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
    const { provider, providerId, accessToken } = checkUserExistsDto;

    await this.validateSnsUserInfo(provider, providerId, accessToken);

    const user = await this.userRepository.findByProviderId(
      provider,
      providerId,
    );

    return !!user;
  }

  async saveCities(userId: number, cityIds: number[]): Promise<void> {
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

  async getInterestCities(
    userId: number,
  ): Promise<{ id: number; name: string }[]> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '사용자를 찾을 수 없습니다',
      });
    }

    // 관심도시 조회 로직 구현
    // TODO: 실제 사용자의 관심도시를 조회하는 로직 구현 필요
    // 현재는 메서드만 정의하고 실제 구현은 추후 필요에 따라 작성

    // 임시 데이터 반환 (실제 구현 시 DB에서 조회하는 로직으로 변경 필요)
    return [];
  }
}
