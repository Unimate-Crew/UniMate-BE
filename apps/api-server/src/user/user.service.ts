import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRepository } from '@app/database';
import { SignUpDto } from './dto/sign-up.dto';
import { SnsServiceFactory } from '../sns/sns.service.factory';

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

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { provider, providerId, accessToken, nickname, profileImageUrl } =
      signUpDto;

    const snsService = this.snsServiceFactory.getService(provider);
    const snsUserInfo = await snsService.getUserInfo(accessToken);

    // SNS에서 받아온 정보와 클라이언트에서 전달한 정보가 일치하는지 검증
    if (snsUserInfo.id !== providerId) {
      throw new UnauthorizedException('Invalid user information');
    }

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
}
