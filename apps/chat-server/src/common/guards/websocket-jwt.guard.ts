import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebSocketErrorCode } from '../websocket-error-codes';

export interface JwtPayload {
  userId: number;
  provider: string;
  type: string;
}

@Injectable()
export class WebSocketJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromClient(client);

      if (!token) {
        throw new WsException({
          code: WebSocketErrorCode.AUTH001,
          message: 'No token provided',
        });
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      }) as JwtPayload;

      if (payload.type !== 'ACCESS') {
        throw new WsException({
          code: WebSocketErrorCode.AUTH001,
          message: 'Invalid token type',
        });
      }

      // 클라이언트 객체에 사용자 정보 저장
      (client as any).user = { userId: payload.userId };

      return true;
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException({
        code: WebSocketErrorCode.AUTH001,
        message: 'Invalid token',
      });
    }
  }

  private extractTokenFromClient(client: Socket): string | null {
    // 토큰을 여러 방법으로 추출 시도
    // 1. Authorization 헤더에서
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. 쿼리 파라미터에서
    const { token } = client.handshake.query;
    if (token && typeof token === 'string') {
      return token;
    }

    // 3. 쿠키에서
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const tokenCookie = cookies
        .split(';')
        .find((cookie) => cookie.trim().startsWith('access_token='));
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
    }

    return null;
  }
}
