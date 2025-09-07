import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { WebSocketUser } from '../decorators/websocket-user.decorator';

@Injectable()
export class WebSocketAuthMiddleware {
  private readonly logger = new Logger(WebSocketAuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Socket.IO handshake middleware for JWT authentication
   */
  createMiddleware() {
    return (socket: Socket, next: (err?: Error) => void) => {
      try {
        const token = this.extractTokenFromSocket(socket);

        if (!token) {
          this.logger.warn(`No token provided for socket ${socket.id}`);
          return next(new Error('Authentication token required'));
        }

        const payload = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET'),
        });

        if (!payload.userId) {
          this.logger.warn(`Invalid token payload for socket ${socket.id}`);
          return next(new Error('Invalid token payload'));
        }

        // Attach user to socket for later use
        (socket as any).user = {
          userId: payload.userId,
        } as WebSocketUser;

        this.logger.log(
          `Socket ${socket.id} authenticated for user ${payload.userId}`,
        );
        next();
      } catch (error) {
        this.logger.error(
          `Authentication failed for socket ${socket.id}:`,
          error.message,
        );
        next(new Error('Invalid authentication token'));
      }
    };
  }

  /**
   * Extract JWT token from socket connection
   * Supports multiple token sources: query, headers, auth object
   */
  private extractTokenFromSocket(socket: Socket): string | null {
    // 1. From query parameters (?token=...)
    if (socket.handshake.query?.token) {
      const token = socket.handshake.query.token as string;
      return token.startsWith('Bearer ') ? token.slice(7) : token;
    }

    // 2. From headers (Authorization: Bearer ...)
    const authHeader = socket.handshake.headers?.authorization as string;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 3. From auth object (socket.io client auth option)
    if (socket.handshake.auth?.token) {
      const token = socket.handshake.auth.token as string;
      return token.startsWith('Bearer ') ? token.slice(7) : token;
    }

    // 4. From cookies (if available)
    const cookies = socket.handshake.headers?.cookie;
    if (cookies) {
      const tokenCookie = cookies
        .split(';')
        .find((cookie) => cookie.trim().startsWith('token='));

      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
    }

    return null;
  }
}
