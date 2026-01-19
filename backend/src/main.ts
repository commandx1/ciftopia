import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins =
    configService.get<string>('ALLOWED_ORIGINS')?.split(',') || [];

  const wildcardPattern =
    /^https?:\/\/([a-z0-9-]+)\.(ciftopia\.com|ciftopia\.local)(:\d+)?$/;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // No origin (server-to-server, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check wildcard subdomain pattern
      const isWildcardMatch = wildcardPattern.test(origin);

      // Check exact match from env or localhost
      const isAllowedOrigin =
        allowedOrigins.some((allowed) => origin.includes(allowed.trim())) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (isAllowedOrigin || isWildcardMatch) {
        callback(null, true);
      } else {
        console.error(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-subdomain'],
  });

  await app.listen(configService.get('PORT') ?? 3001);
}
bootstrap();
