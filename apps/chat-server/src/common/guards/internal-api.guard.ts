import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalApiGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-internal-api-key'] as string;
    const expectedApiKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!expectedApiKey) {
      this.logger.error('INTERNAL_API_KEY is not configured');
      throw new UnauthorizedException('Internal API key not configured');
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      this.logger.warn(`Invalid internal API key attempt from ${request.ip}`);
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
