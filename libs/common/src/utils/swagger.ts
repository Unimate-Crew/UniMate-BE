import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';

interface SwaggerConfig {
  title: string;
  description: string;
  path: string;
  credentials?: {
    username: string;
    password: string;
  };
}

export function setupSwagger(
  app: INestApplication,
  config: SwaggerConfig,
): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (config.credentials) {
    app.use(
      [`/${config.path}`, `/${config.path}-json`],
      expressBasicAuth({
        challenge: true,
        users: {
          [config.credentials.username]: config.credentials.password,
        },
      }),
    );
  }

  const documentBuilder = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT Authorization header using the Bearer scheme.',
        in: 'header',
      },
      'accessToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup(config.path, app, document);
}
