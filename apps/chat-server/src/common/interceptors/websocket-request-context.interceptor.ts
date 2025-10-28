import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MikroORM, RequestContext } from '@mikro-orm/core';

/**
 * WebSocket 이벤트에 MikroORM RequestContext를 제공하는 인터셉터
 *
 * HTTP 요청과 달리 WebSocket 이벤트는 RequestContext가 자동으로 생성되지 않음.
 * 이 인터셉터는 각 WebSocket 이벤트 핸들러를 RequestContext로 감싸서
 * EntityManager가 정상적으로 동작하도록 함.
 */
@Injectable()
export class WebSocketRequestContextInterceptor implements NestInterceptor {
  constructor(private readonly orm: MikroORM) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextType = context.getType();

    // WebSocket이 아닌 경우 그대로 통과
    if (contextType !== 'ws') {
      return next.handle();
    }

    // WebSocket 이벤트를 RequestContext로 감싸기
    return new Observable((observer) => {
      RequestContext.create(this.orm.em, () => {
        const subscription = next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });

        return () => subscription.unsubscribe();
      });
    });
  }
}
