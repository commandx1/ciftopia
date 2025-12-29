import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.enableCors({
    origin: true, // In production, replace with specific domains
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
