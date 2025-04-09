import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRepository, AuthProvider } from '@app/database';
import { SignUpDto } from './dto/sign-up.dto';
import { SnsServiceFactory } from '../sns/sns.service.factory';
import { SignInDto } from './dto/sign-in.dto';
import { ErrorCode } from '../common/error-code';

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
}
