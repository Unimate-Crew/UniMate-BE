// eslint-disable-next-line max-classes-per-file
export class SocialLoginRequestDto {
  redirectUrl: string;
}

export class SocialLoginResultDto {
  user: {
    id: number;
    isSignUpCompleted: boolean;
  };

  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}
