import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpServer,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';
import { Logger } from 'winston';
import { ErrorCode } from './error-code';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    super();
    this.logger = logger.child({ context: GlobalExceptionFilter.name });
  }

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();

    if (exception instanceof UnauthorizedException) {
      const convertedException = exception.getResponse() as any;

      response.status(HttpStatus.UNAUTHORIZED).json({
        errorCode: convertedException.errorCode || ErrorCode.UNAUTHORIZED,
        details: convertedException.message || '유효하지 않은 토큰입니다.',
      });
    } else if (exception instanceof HttpException) {
      super.catch(exception, host);
    } else {
      this.logger.error('Unhandled Exception', {
        message: exception.message,
        url: request.url,
        name: exception.name,
        stack: exception.stack,
      });
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        errorMessage: '서버 오류가 발생했습니다.',
      });
    }
  }
}
