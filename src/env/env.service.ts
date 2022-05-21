import { Inject, Injectable } from '@nestjs/common';
import { EnvModuleConfig, EnvModuleOptions } from './env.interface';
import { KEY_OPTIONS } from '../common/constants';
import { KEY_CONFIG } from './env.constant';
import { EnvModule } from './env.module';

@Injectable()
export class EnvService {
  constructor(
    @Inject(KEY_CONFIG) private readonly config: EnvModuleConfig,
    @Inject(KEY_OPTIONS) private readonly options: EnvModuleOptions,
  ) {}
  get(key: keyof typeof EnvModule.ENVS) {
    return EnvModule.ENVS[key];
  }
}
