import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface WebSocketUser {
  userId: number;
}

export const WsUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): WebSocketUser => {
    const client = context.switchToWs().getClient<Socket>();
    return (client as any).user as WebSocketUser;
  },
);
