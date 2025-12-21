import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { ErrorCode } from '@app/common';
import { SnsService, SnsUserInfo } from './sns.service.interface';

interface AppleJwtPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  auth_time: number;
  nonce_supported: boolean;
  email?: string;
  email_verified?: string | boolean;
  is_private_email?: string | boolean;
  real_user_status?: number;
}

@Injectable()
export class AppleSnsService implements SnsService {
  private readonly APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';

  private readonly APPLE_ISSUER = 'https://appleid.apple.com';

  private readonly jwksClient: jwksClient.JwksClient;

  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.getOrThrow<string>('APPLE_CLIENT_ID');

    this.jwksClient = jwksClient({
      jwksUri: this.APPLE_JWKS_URL,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  async getUserInfo(identityToken: string): Promise<SnsUserInfo> {
    try {
      const decodedHeader = jwt.decode(identityToken, { complete: true });

      if (!decodedHeader || !decodedHeader.header.kid) {
        throw new UnauthorizedException({
          code: ErrorCode.INVALID_SNS_TOKEN,
          message: 'Invalid Apple identity token format',
        });
      }

      const key = await this.jwksClient.getSigningKey(decodedHeader.header.kid);
      const publicKey = key.getPublicKey();

      const payload = jwt.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: this.APPLE_ISSUER,
        audience: this.clientId,
      }) as AppleJwtPayload;

      return {
        id: payload.sub,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException({
          code: ErrorCode.INVALID_SNS_TOKEN,
          message: 'Apple identity token has expired',
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException({
          code: ErrorCode.INVALID_SNS_TOKEN,
          message: 'Invalid Apple identity token signature',
        });
      }

      throw new UnauthorizedException({
        code: ErrorCode.INVALID_SNS_TOKEN,
        message: `Failed to verify Apple identity token: ${error.message}`,
      });
    }
  }
}
