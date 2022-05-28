import { DynamicModule, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { UsersModuleOptions } from './users.interface';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { ValidProperty } from './entities/validProperty.entity';
import { UserTokenAccounts } from './entities/userTokenAccounts.entity';

@Module({})
export class UsersModule {
  static forRoot(options: UsersModuleOptions = { test: '' }): DynamicModule {
    return {
      module: UsersModule,
      imports: [
        TypeOrmModule.forFeature([
          User,
          Verification,
          ValidProperty,
          UserTokenAccounts,
        ]),
      ],
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
