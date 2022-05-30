import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { Transactions } from 'src/users/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { BannerTag } from './entities/bannerTag.entity';
import { NftBanner } from './entities/nftBanner.entity';
import { ValidationModuleOptions } from './validation.interface';
import { ValidationResolver } from './validation.resolver';
import { ValidationService } from './validation.service';

@Module({})
export class ValidationModule {
  static forRoot(options: ValidationModuleOptions): DynamicModule {
    return {
      module: ValidationModule,
      imports: [
        TypeOrmModule.forFeature([BannerTag, NftBanner, User, Transactions]),
      ],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        ValidationService,
        ValidationResolver,
      ],
      exports: [ValidationService, ValidationResolver],
    };
  }
}
