import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ErrorCode, ErrorMessage } from '@app/common';
import { WebSocketChatException } from '../exceptions/websocket-chat.exception';

/**
 * WebSocket ACK 예외 필터
 *
 * REST API의 ExceptionFilter와 동일한 역할:
 * - 모든 예외를 catch
 * - 일관된 에러 응답 형식으로 변환
 *
 * 에러 응답 형식:
 * {
 *   isSuccess: false,
 *   errorCode: string,
 *   errorMessage: string
 * }
 */
@Catch()
export class WebSocketAckExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WebSocketAckExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const callback = host.getArgByIndex(2); // ACK callback

    // ACK callback이 없으면 처리하지 않음
    if (typeof callback !== 'function') {
      this.logger.warn('No ACK callback found for error response');
      return;
    }

    const { errorCode, errorMessage } = this.extractErrorInfo(exception);

    // ACK callback으로 에러 응답 전달
    callback({
      isSuccess: false,
      errorCode,
      errorMessage,
    });
  }

  /**
   * 에러로부터 코드와 메시지를 추출
   */
  private extractErrorInfo(exception: any): {
    errorCode: string;
    errorMessage: string;
  } {
    // WebSocketChatException
    if (exception instanceof WebSocketChatException) {
      const { errorCode } = exception;
      const error = exception.getError();
      const errorMessage =
        (typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : ErrorMessage[errorCode]) || ErrorMessage[errorCode];

      this.logger.debug(`WebSocketChatException: ${errorCode}`, {
        errorCode,
        errorMessage,
        stack: exception.stack,
      });

      return { errorCode, errorMessage };
    }

    // WsException
    if (exception instanceof WsException) {
      const error = exception.getError();

      if (typeof error === 'string') {
        this.logger.error('WsException with string error', {
          error,
          stack: exception.stack,
        });

        return {
          errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
          errorMessage: error,
        };
      }

      if (typeof error === 'object' && error !== null) {
        const errorCode =
          (error as any).code || ErrorCode.INTERNAL_SERVER_ERROR;
        const errorMessage =
          (error as any).message ||
          ErrorMessage[(error as any).code] ||
          'Internal server error occurred';

        this.logger.error(`WsException: ${errorCode}`, {
          errorCode,
          errorMessage,
          stack: exception.stack,
        });

        return { errorCode, errorMessage };
      }

      this.logger.error('WsException with invalid error format', {
        error,
        stack: exception.stack,
      });

      return {
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        errorMessage: 'Internal server error occurred',
      };
    }

    // 일반 에러
    this.logger.error('Unexpected WebSocket error', {
      error: exception.message,
      stack: exception.stack,
    });

    return {
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      errorMessage: exception.message || 'Internal server error occurred',
    };
  }
}
