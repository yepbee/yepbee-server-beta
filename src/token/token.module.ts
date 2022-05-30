import { DynamicModule, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { TokenModuleOptions } from './token.interface';
import { TokenResolver } from './token.resolver';
import { TokenService } from './token.service';

@Module({
  providers: [TokenResolver, TokenService],
})
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
