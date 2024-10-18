import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpServer();
  const router = app.getHttpAdapter().getInstance();

  const logger = new Logger('Routes');
  
  // Log each route
  // router._router.stack.forEach(layer => {
  //   if (layer.route && layer.route.path) {
  //     const method = layer.route.stack[0].method.toUpperCase();
  //     const path = layer.route.path;
  //     logger.log(`${method} ${path}`);
  //   }
  // });

  await app.listen(3000);
}
bootstrap();
