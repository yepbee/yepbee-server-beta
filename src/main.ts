import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GLOBAL_OPTIONS, DEFAULT_PORT } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(DEFAULT_PORT);

  GLOBAL_OPTIONS.set({
    baseUrl: await app.getUrl(),
    isInitialized: true,
  });

  console.log(GLOBAL_OPTIONS.getAll());
}
bootstrap();
