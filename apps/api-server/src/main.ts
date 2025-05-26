import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { WinstonModule } from 'nest-winston';
import { setupSwagger } from 'libs/common/src/utils/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ApiServerModule } from './api-server.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiServerModule);
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
    title: 'API Server',
    description: 'API Server Document',
    path: 'api-docs',
    credentials: {
      username: configService.get('SWAGGER_USERNAME'),
      password: configService.get('SWAGGER_PASSWORD'),
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.info(`🚀 Server listen at http://localhost:${port}/`);
}
bootstrap();
