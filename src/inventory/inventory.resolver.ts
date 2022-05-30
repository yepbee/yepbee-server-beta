import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetBannersInput, GetBannersOutput } from './dtos/getBanners.dto';
import {
  GetBannersByRingInput,
  GetBannersByRingOutput,
} from './dtos/getBannersByRing.dto';
import { InventoryService } from './inventory.service';

@Resolver()
export class InventoryResolver {
  constructor(private readonly inventoriesService: InventoryService) {}
  @Query(() => GetBannersOutput)
  getBanners(
    @Args() getBannersInput: GetBannersInput,
  ): Promise<GetBannersOutput> {
    return this.inventoriesService.getBanners(getBannersInput);
  }
  @Query(() => GetBannersByRingOutput)
  getBannersByRing(
    @Args() getBannersByRingInput: GetBannersByRingInput,
  ): Promise<GetBannersByRingOutput> {
    return this.inventoriesService.getBannersByRing(getBannersByRingInput);
  }
}
