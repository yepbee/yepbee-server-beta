import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from './auth.guard';
import { AuthModuleOptions } from './auth.interface';
import { AuthService } from './auth.service';

@Global()
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions = { test: '' }): DynamicModule {
    return {
      module: AuthModule,
      imports: [TypeOrmModule.forFeature([User])],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
        AuthService,
      ],
      exports: [AuthService],
    };
  }
}
