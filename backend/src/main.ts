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

  // Wildcard pattern: *.ciftopia.com ve ciftopia.com (root)
  const wildcardPattern = /^https:\/\/(?:[a-z0-9-]+\.)?ciftopia\.com$/;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // No origin (server-to-server, Postman, vb.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check exact match from env
      const isAllowedOrigin = allowedOrigins.some((allowed) =>
        origin.includes(allowed.trim()),
      );

      // Check wildcard subdomain pattern (root domain dahil: ciftopia.com ve *.ciftopia.com)
      const isWildcardMatch = wildcardPattern.test(origin);

      if (isAllowedOrigin || isWildcardMatch) {
        callback(null, true);
      } else {
        console.log('CORS Rejected for origin:', origin);
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
