import { NestFactory } from '@nestjs/core';
import { Logger } from 'winston';
import { WinstonModule } from 'nest-winston';
import { ApiServerModule } from './api-server.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiServerModule);
  const logger = app.get(Logger);

  app.useLogger(
    WinstonModule.createLogger({
      instance: logger,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.info(`🚀 Server listen at http://localhost:${port}/`);
}
bootstrap();
