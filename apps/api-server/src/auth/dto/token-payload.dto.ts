import { AuthProvider } from '@app/database';

export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

export interface TokenPayloadDto {
  userId: number;
  provider: AuthProvider;
  type: TokenType;
}
