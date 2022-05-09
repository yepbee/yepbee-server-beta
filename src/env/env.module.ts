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
      ignoreEnvFile: EnvModule.MODE === 'prod',
    }),
  ],
})
export class EnvModule {
  static readonly MODE = getMode({ strict: true });
  static readonly JOINED = joinMode(EnvModule.MODE, {
    env: '.env.',
  });
  static ENVS = getEnvs({
    F: '',
    FOO: '',
  });
  static config = {
    mode: EnvModule.MODE,
    joined: EnvModule.JOINED,
    envs: EnvModule.ENVS,
  };

  static forRoot(options: EnvModuleOptions = { test: '' }): DynamicModule {
    /* Re-load */
    this.ENVS = getEnvs({
      F: '',
      FOO: '',
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
