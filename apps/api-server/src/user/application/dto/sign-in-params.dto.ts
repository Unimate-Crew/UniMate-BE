import { OAuthProvider } from '@app/database';

export class SignInParamsDto {
  provider: OAuthProvider;

  providerId: string;

  oAuthToken: string;

  static of(
    provider: OAuthProvider,
    providerId: string,
    oAuthToken: string,
  ): SignInParamsDto {
    const params = new SignInParamsDto();
    params.provider = provider;
    params.providerId = providerId;
    params.oAuthToken = oAuthToken;
    return params;
  }
}
