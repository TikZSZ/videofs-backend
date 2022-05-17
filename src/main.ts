import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  app.enableCors({
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'PATCH'],
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://dmaill.vercel.app'
        : 'https://localhost:3000',
    exposedHeaders: ['SET-COOKIE'],
  });
  await app.listen(5000);
}
bootstrap();
