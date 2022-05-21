import { DynamicModule, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { UsersModuleOptions } from './users.interface';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({})
export class UsersModule {
  static forRoot(options: UsersModuleOptions = { test: '' }): DynamicModule {
    return {
      module: UsersModule,
      imports: [TypeOrmModule.forFeature([User])],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        UsersResolver,
        UsersService,
      ],
      exports: [UsersResolver, UsersService],
    };
  }
}
