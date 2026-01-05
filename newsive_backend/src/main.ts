import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  cookieParser  from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
  app.use(cookieParser());
  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();
