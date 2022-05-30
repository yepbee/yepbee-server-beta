import { DynamicModule, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { GpsModuleOptions } from './gps.interface';
import { GpsService } from './gps.service';

@Module({})
export class GpsModule {
  static forRoot(options: GpsModuleOptions = { test: '' }): DynamicModule {
    return {
      module: GpsModule,
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        GpsService,
      ],
      exports: [GpsService],
    };
  }
}
