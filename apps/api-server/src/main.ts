import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { WinstonModule } from 'nest-winston';
import * as session from 'express-session';
import { setupSwagger } from 'libs/common/src/utils/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ApiServerModule } from './api-server.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiServerModule);
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  setupSwagger(app, {
    title: 'API Server',
    description: 'API Server Document',
    path: 'api-docs',
    credentials: {
      username: configService.get('SWAGGER_USERNAME'),
      password: configService.get('SWAGGER_PASSWORD'),
    },
  });

  app.useLogger(
    WinstonModule.createLogger({
      instance: logger,
    }),
  );

  app.use(
    session({
      secret: configService.get('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000, // 1분
      },
    }),
  );

  // 전역 파이프 설정 추가
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS 설정
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.info(`🚀 Server listen at http://localhost:${port}/`);
}
bootstrap();
