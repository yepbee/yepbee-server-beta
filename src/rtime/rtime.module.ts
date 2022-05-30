import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { RtimeEntity } from './entities/rtime.entity';
import { RtimeModuleOptions } from './rtime.interface';
import { RtimeService } from './rtime.service';

@Global()
@Module({})
export class RtimeModule {
  static forRoot(options: RtimeModuleOptions): DynamicModule {
    return {
      module: RtimeModule,
      imports: [TypeOrmModule.forFeature([RtimeEntity])],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        RtimeService,
      ],
      exports: [RtimeService],
    };
  }
}
