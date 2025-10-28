import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { WinstonModule } from 'nest-winston';
import { setupSwagger } from '@app/common';
import { ChatServerModule } from './chat-server.module';
import { WebSocketRedisAdapterConfig } from './common/config/websocket-redis-adapter.config';

async function bootstrap() {
  const app = await NestFactory.create(ChatServerModule);
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // WebSocket에서도 타입 자동 변환
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useLogger(
    WinstonModule.createLogger({
      instance: logger,
    }),
  );

  setupSwagger(app, {
    title: 'Chat Server',
    description: 'Chat Server Document',
    path: 'chat-docs',
    credentials: {
      username: configService.get('SWAGGER_USERNAME'),
      password: configService.get('SWAGGER_PASSWORD'),
    },
  });

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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.info(`🚀 Server listen at http://localhost:${port}/`);
}
bootstrap();
