import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const router = app.getHttpAdapter().getInstance();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             
      forbidNonWhitelisted: true,  
      transform: true,             
    }),
  );

  await app.listen(3000);
}

bootstrap();
