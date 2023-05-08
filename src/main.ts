import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerFactory } from './config/swagger.config';
import { join } from 'path';
const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  SwaggerFactory.create(app);
  await app.listen(PORT);
}
bootstrap();
