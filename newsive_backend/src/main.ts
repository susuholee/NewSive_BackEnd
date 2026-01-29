import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from "express";
import cookieParser  from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
  app.use(cookieParser());
  app.use('/images', express.static(join(__dirname, '..',  'public/images')));
  app.use('/uploads', express.static(join(__dirname, '..',  'public/uploads')));


   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();
