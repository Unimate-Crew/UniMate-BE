import { NestFactory } from '@nestjs/core';
import { ApiServerModule } from './api-server.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiServerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
