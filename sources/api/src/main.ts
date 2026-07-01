import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ENV_PATH } from './config/paths';
import { AppModule } from './app.module';

dotenv.config({ path: ENV_PATH });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // The Angular dev proxy avoids CORS in dev; enableCors is a safety net for direct calls.
  app.enableCors({ origin: process.env.CLIENT_ORIGIN ?? true });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
