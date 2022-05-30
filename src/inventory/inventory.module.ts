import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { User } from 'src/users/entities/user.entity';
import { BannerTag } from 'src/validation/entities/bannerTag.entity';
import { NftBanner } from 'src/validation/entities/nftBanner.entity';
import { InventoryModuleOptions } from './inventory.interface';
import { InventoryResolver } from './inventory.resolver';
import { InventoryService } from './inventory.service';

@Module({})
export class InventoryModule {
  static forRoot(options?: InventoryModuleOptions): DynamicModule {
    return {
      module: InventoryModule,
      imports: [TypeOrmModule.forFeature([NftBanner, BannerTag, User])],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        InventoryService,
        InventoryResolver,
      ],
      exports: [InventoryService, InventoryResolver],
    };
  }
}
