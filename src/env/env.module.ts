import { DynamicModule, Global, Module } from '@nestjs/common';
import { EnvModuleOptions } from './env.interface';
import { EnvService } from './env.service';
import { KEY_OPTIONS } from '../common/constants';
import { KEY_CONFIG } from './env.constant';
import { ConfigModule } from '@nestjs/config';
import { getEnvs, getMode, joinMode } from 'modern-v';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: EnvModule.JOINED.env,
      ignoreEnvFile: EnvModule.MODE === 'production',
    }),
  ],
})
export class EnvModule {
  static readonly MODE = getMode({
    strict: true,
    list: ['development', 'test', 'production'],
  });
  static readonly isNotProduction = EnvModule.MODE !== 'production';
  static readonly JOINED = joinMode(EnvModule.MODE, {
    env: '.env.',
  });
  static ENVS = getEnvs({
    DB_HOST: '',
    DB_PORT: '',
    DB_USERNAME: '',
    DB_PASSWORD: '',
    DB_NAME: '',
  });
  static config = {
    mode: EnvModule.MODE,
    joined: EnvModule.JOINED,
    envs: EnvModule.ENVS,
  };

  static forRoot(options: EnvModuleOptions = { test: '' }): DynamicModule {
    /* Re-load */
    this.ENVS = getEnvs({
      DB_HOST: '',
      DB_PORT: '',
      DB_USERNAME: '',
      DB_PASSWORD: '',
      DB_NAME: '',
    });

    this.config = {
      mode: this.MODE,
      joined: this.JOINED,
      envs: this.ENVS,
    };
    /* ******* */

    return {
      module: EnvModule,
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        {
          provide: KEY_CONFIG,
          useValue: this.config,
        },
        EnvService,
      ],
      exports: [EnvService],
    };
  }
}
