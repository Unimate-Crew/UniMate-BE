export interface SocialLoginCallbackResultDto {
  redirectUrl: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}
