import { OAuthProvider } from '@app/database';

export class CheckUserExistsParamsDto {
  provider: OAuthProvider;

  providerId: string;

  static of(
    provider: OAuthProvider,
    providerId: string,
  ): CheckUserExistsParamsDto {
    const params = new CheckUserExistsParamsDto();
    params.provider = provider;
    params.providerId = providerId;
    return params;
  }
}
