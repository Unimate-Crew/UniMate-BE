import { NestFactory } from '@nestjs/core';
import { ChatServerModule } from './chat-server.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatServerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
