import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GLOBAL_OPTIONS, DEFAULT_PORT } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(DEFAULT_PORT);

  GLOBAL_OPTIONS.baseUrl = await app.getUrl();
  GLOBAL_OPTIONS.isInitialized = true;

  console.log(GLOBAL_OPTIONS);
}
bootstrap();
