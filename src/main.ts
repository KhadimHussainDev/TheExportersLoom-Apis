import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const router = app.getHttpAdapter().getInstance();
  const logger = new Logger('Routes');
  await app.listen(3000);
}
bootstrap();
