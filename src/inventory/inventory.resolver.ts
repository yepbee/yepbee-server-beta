import { Args, Query, Resolver } from '@nestjs/graphql';
import { Allow } from 'src/auth/allow.decorator';
import { GetBannersInput, GetBannersOutput } from './dtos/getBanners.dto';
import {
  GetBannersByH3RingInput,
  GetBannersByH3RingOutput,
  GetBannersByRingInput,
  GetBannersByRingOutput,
} from './dtos/getBannersByRing.dto';
import { InventoryService } from './inventory.service';

@Resolver()
export class InventoryResolver {
  constructor(private readonly inventoriesService: InventoryService) {}
  @Query(() => GetBannersOutput)
  @Allow(['Guest'])
  getBanners(
    @Args() getBannersInput: GetBannersInput,
  ): Promise<GetBannersOutput> {
    return this.inventoriesService.getBanners(getBannersInput);
  }
  @Query(() => GetBannersByH3RingOutput)
  @Allow(['Guest'])
  getBannersByH3Ring(
    @Args() getBannersByH3RingInput: GetBannersByH3RingInput,
  ): Promise<GetBannersByH3RingOutput> {
    return this.inventoriesService.getBannersByH3Ring(getBannersByH3RingInput);
  }
  @Query(() => GetBannersByRingOutput)
  @Allow(['Guest'])
  getBannersByRing(
    @Args() getBannersByRingInput: GetBannersByRingInput,
  ): Promise<GetBannersByRingOutput> {
    return this.inventoriesService.getBannersByRing(getBannersByRingInput);
  }
}
