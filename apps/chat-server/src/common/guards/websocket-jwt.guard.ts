import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { WebSocketUser } from '../decorators/websocket-user.decorator';

@Injectable()
export class WebSocketJwtGuard implements CanActivate {
  private readonly logger = new Logger(WebSocketJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient<Socket>();

      // 1. Check if user was already authenticated via handshake middleware
      const existingUser = (client as any).user as WebSocketUser;
      if (existingUser?.userId) {
        // 2. Re-verify token freshness for long-lived connections
        const token = this.extractTokenFromClient(client);
        if (token) {
          try {
            const payload = this.jwtService.verify(token, {
              secret: this.configService.get('JWT_SECRET'),
            });

            // Check if token is still valid and user ID matches
            if (payload.userId === existingUser.userId) {
              this.logger.debug(
                `Token re-verification successful for user ${existingUser.userId}`,
              );
              return true;
            } else {
              this.logger.warn(
                `User ID mismatch: token=${payload.userId}, existing=${existingUser.userId}`,
              );
            }
          } catch (tokenError) {
            this.logger.warn(
              `Token re-verification failed: ${tokenError.message}`,
            );
            // Token expired or invalid - disconnect the client
            client.disconnect();
            return false;
          }
        }

        // If no token found but user exists from handshake, still allow
        // This handles cases where token was only provided at connection time
        return true;
      }

      // 3. Fallback: If no handshake authentication, try direct token verification
      this.logger.warn(
        `No handshake authentication found for socket ${client.id}, attempting direct verification`,
      );
      const token = this.extractTokenFromClient(client);

      if (!token) {
        this.logger.error(
          `No authentication token found for socket ${client.id}`,
        );
        return false;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (!payload.userId) {
        this.logger.error(`Invalid token payload for socket ${client.id}`);
        return false;
      }

      // Attach user info for this request
      (client as any).user = {
        userId: payload.userId,
      } as WebSocketUser;

      this.logger.debug(
        `Direct authentication successful for user ${payload.userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract JWT token from WebSocket client
   * Supports multiple token sources for compatibility
   */
  private extractTokenFromClient(client: Socket): string | null {
    // 1. From query parameters
    if (client.handshake.query?.token) {
      const token = client.handshake.query.token as string;
      return token.startsWith('Bearer ') ? token.slice(7) : token;
    }

    // 2. From headers
    const authHeader = client.handshake.headers?.authorization as string;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 3. From auth object
    if (client.handshake.auth?.token) {
      const token = client.handshake.auth.token as string;
      return token.startsWith('Bearer ') ? token.slice(7) : token;
    }

    // 4. From cookies
    const cookies = client.handshake.headers?.cookie;
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
