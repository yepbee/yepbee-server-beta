import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { GLOBAL_OPTIONS, DEFAULT_PORT } from './common/constants';
import * as crypto from 'crypto';

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any[]) => crypto.randomBytes(arr.length),
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // file receiver
  app.use(graphqlUploadExpress({ maxFieldSize: 8 * 1000 * 1000 }));

  await app.listen(process.env['PORT'] || DEFAULT_PORT);

  GLOBAL_OPTIONS.set({
    baseUrl: await app.getUrl(),
    isInitialized: true,
  });

  console.log(GLOBAL_OPTIONS.getAll());
}
bootstrap();
