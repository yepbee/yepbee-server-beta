import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { Transactions } from 'src/users/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { BannerTag } from './mint/entities/bannerTag.entity';
import { NftBanner } from './mint/entities/nftBanner.entity';
import { NftModuleOptions } from './nft.interface';
import { NftResolver } from './nft.resolver';
import { NftService } from './nft.service';

@Module({})
export class NftModule {
  static forRoot(options: NftModuleOptions): DynamicModule {
    return {
      module: NftModule,
      imports: [
        TypeOrmModule.forFeature([BannerTag, NftBanner, User, Transactions]),
      ],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        NftService,
        NftResolver,
      ],
      exports: [NftService, NftResolver],
    };
  }
}
