import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const router = app.getHttpAdapter().getInstance();
  // const logger = new Logger('Routes');

  // Apply global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strips out properties not defined in DTO
      forbidNonWhitelisted: true,   // Throws an error if non-whitelisted properties are present
      transform: true,              // Automatically transforms incoming payloads to the correct types (based on DTO)
    }),
  );

  await app.listen(3000);
}

bootstrap();
