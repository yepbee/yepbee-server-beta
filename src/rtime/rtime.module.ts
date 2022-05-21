import { DynamicModule, Global, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { RtimeModuleOptions } from './rtime.interface';
import { RtimeService } from './rtime.service';

@Global()
@Module({})
export class RtimeModule {
  static forRoot(options: RtimeModuleOptions): DynamicModule {
    return {
      module: RtimeModule,
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
