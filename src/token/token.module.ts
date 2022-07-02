import { DynamicModule, Global, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { TokenModuleOptions } from './token.interface';
import { TokenService } from './token.service';

@Global()
@Module({})
export class TokenModule {
  static forRoot(options: TokenModuleOptions = { test: '' }): DynamicModule {
    return {
      module: TokenModule,
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        TokenService,
      ],
      exports: [TokenService],
    };
  }
}
