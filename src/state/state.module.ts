import { DynamicModule, Global, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { StateModuleOptions } from './state.interface';
import { StateService } from './state.service';

@Global()
@Module({})
export class StateModule {
  static forRoot(options: StateModuleOptions = { test: '' }): DynamicModule {
    return {
      module: StateModule,
      imports: [],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        StateService,
      ],
      exports: [StateService],
    };
  }
}
