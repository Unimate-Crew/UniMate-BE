import { AuthProvider } from '@app/database';

export class SignUpDto {
  provider!: AuthProvider;

  providerId!: string;

  accessToken!: string;

  nickname!: string;

  profileImageUrl!: string;
}
