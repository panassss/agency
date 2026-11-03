import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { appValidationPipe } from './common/pipes/validation.pipe.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Render terminates TLS at a proxy; trust it so rate limiting sees real client IPs.
  app.set('trust proxy', 1);
  app.use(helmet());
  app.enableCors({
    origin: config
      .get<string>('CORS_ORIGIN', '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(appValidationPipe);
  app.useGlobalFilters(new PrismaExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Canvix API')
    .setDescription('REST API агенції комплексного розвитку бізнесу Canvix')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(config.get<number>('PORT', 4000));
}
await bootstrap();
