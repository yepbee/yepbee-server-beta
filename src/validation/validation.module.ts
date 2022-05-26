import { DynamicModule, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { ValidationModuleOptions } from './validation.interface';
import { ValidationResolver } from './validation.resolver';
import { ValidationService } from './validation.service';

@Module({})
export class ValidationModule {
  static forRoot(options: ValidationModuleOptions): DynamicModule {
    return {
      module: ValidationModule,
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        ValidationService,
        ValidationResolver,
      ],
      exports: [ValidationService, ValidationResolver],
    };
  }
}
