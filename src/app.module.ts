import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from './env/env.module';

@Module({
  imports: [EnvModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
