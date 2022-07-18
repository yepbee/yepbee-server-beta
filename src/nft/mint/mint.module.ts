import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { Transactions } from 'src/users/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { BannerTag } from './entities/bannerTag.entity';
import { NftBanner } from './entities/nftBanner.entity';
import { MintModuleOptions } from './mint.interface';
import { MintResolver } from './mint.resolver';
import { MintService } from './mint.service';

@Module({})
export class MintModule {
  static forRoot(options: MintModuleOptions): DynamicModule {
    return {
      module: MintModule,
      imports: [
        TypeOrmModule.forFeature([BannerTag, NftBanner, User, Transactions]),
      ],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        MintService,
        MintResolver,
      ],
      exports: [MintService, MintResolver],
    };
  }
}
