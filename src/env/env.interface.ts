import { EnvModule } from './env.module';

export type EnvModuleOptions = {
  test: string;
};

export type EnvModuleConfig = typeof EnvModule.config;
