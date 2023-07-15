import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerFactory } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Cấu hình CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // Các nguồn origin cho phép
    credentials: true, // Cho phép chia sẻ cookie và thông tin xác thực
  });

  // app.setGlobalPrefix('api')
  SwaggerFactory.create(app);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
