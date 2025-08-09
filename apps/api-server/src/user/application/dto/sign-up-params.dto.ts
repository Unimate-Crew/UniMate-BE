import { OAuthProvider } from '@app/database';

export class SignUpParamsDto {
  provider: OAuthProvider;

  providerId: string;

  oAuthToken: string;

  nickname: string;

  profileImageKey?: string;

  static of(
    provider: OAuthProvider,
    providerId: string,
    oAuthToken: string,
    nickname: string,
    profileImageKey?: string,
  ): SignUpParamsDto {
    const params = new SignUpParamsDto();
    params.provider = provider;
    params.providerId = providerId;
    params.oAuthToken = oAuthToken;
    params.nickname = nickname;
    params.profileImageKey = profileImageKey;
    return params;
  }
}
