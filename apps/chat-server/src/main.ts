import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from 'libs/common/src/utils/swagger';
import { ChatServerModule } from './chat-server.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatServerModule);
  const configService = app.get(ConfigService);

  setupSwagger(app, {
    title: 'Chat Server',
    description: 'Chat Server Document',
    path: 'api-docs',
    credentials: {
      username: configService.get('SWAGGER_USERNAME'),
      password: configService.get('SWAGGER_PASSWORD'),
    },
  });

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
