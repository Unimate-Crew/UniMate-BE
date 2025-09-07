import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ChatServerModule } from './chat-server.module';
import { WebSocketRedisAdapterConfig } from './common/config/websocket-redis-adapter.config';

async function bootstrap() {
  const app = await NestFactory.create(ChatServerModule);

  // WebSocket Redis 어댑터 설정
  const redisAdapterConfig = app.get(WebSocketRedisAdapterConfig);
  const ioAdapter = new IoAdapter(app);

  // IoAdapter를 확장하여 Redis 어댑터 설정
  const originalCreateIOServer = ioAdapter.createIOServer;
  ioAdapter.createIOServer = function (port: number, options?: any) {
    const server = originalCreateIOServer.call(this, port, options);
    // Redis 어댑터 설정을 비동기로 처리
    redisAdapterConfig.setupRedisAdapter(server);
    return server;
  };

  app.useWebSocketAdapter(ioAdapter);

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
