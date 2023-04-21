import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerFactory } from './config/swagger.config';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';

const PORT = 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initializeTransactionalContext();
  app.useGlobalPipes(new ValidationPipe());
  SwaggerFactory.create(app);
  await app.listen(PORT);
}
bootstrap();
