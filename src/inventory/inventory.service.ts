import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { kRing } from 'h3-js';
import { AsyncTryCatch } from 'src/common/decorators';
import { Ok } from 'src/common/result/result.function';
import { NftBanner } from 'src/validation/entities/nftBanner.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { GetBannersInput, GetBannersOutput } from './dtos/getBanners.dto';
import {
  GetBannersByH3RingInput,
  GetBannersByH3RingOutput,
  GetBannersByRingInput,
  GetBannersByRingOutput,
} from './dtos/getBannersByRing.dto';
import { computeDestinationPoint } from 'geolib';
import { KEY_OPTIONS } from 'src/common/constants';
import { InventoryModuleOptions } from './inventory.interface';

@Injectable()
export class InventoryService {
  private readonly MAX_OUTPUT_LENGTH: number;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: InventoryModuleOptions,
    @InjectRepository(NftBanner)
    private readonly nftBannersRepository: Repository<NftBanner>,
  ) {
    this.MAX_OUTPUT_LENGTH = this.options.maxOutputLength;
  }

  @AsyncTryCatch()
  async getBanners({ where }: GetBannersInput): Promise<GetBannersOutput> {
    const result = await this.nftBannersRepository.find({
      where: where as FindOptionsWhere<NftBanner>[],
      relations: ['creatorUser', 'ownerUser', 'tags'], // !TODO: tags
      take: this.MAX_OUTPUT_LENGTH,
    });
    return Ok(result);
  }
  @AsyncTryCatch()
  async getBannersByH3Ring({
    h3Center,
    radius,
  }: GetBannersByH3RingInput): Promise<GetBannersByH3RingOutput> {
    const h3s = kRing(h3Center, radius).map((h3) => ({ h3 }));
    const result = await this.nftBannersRepository.find({
      where: h3s,
      relations: ['creatorUser', 'ownerUser', 'tags'],
      take: this.MAX_OUTPUT_LENGTH,
    });
    return Ok(result);
  }
  @AsyncTryCatch()
  async getBannersByRing({
    latitude,
    longitude,
    radiusM,
  }: // maxCount = 20, * by likes
  GetBannersByRingInput): Promise<GetBannersByRingOutput> {
    const latLng = { latitude, longitude };
    const abs = Math.abs;
    const latUp = abs(
      abs(computeDestinationPoint(latLng, radiusM, 0).latitude) - abs(latitude),
    );
    const latDown = abs(
      abs(computeDestinationPoint(latLng, -radiusM, 0).latitude) -
        abs(latitude),
    );
    const lngUp = abs(
      abs(computeDestinationPoint(latLng, radiusM, 90).longitude) -
        abs(longitude),
    );
    const lngDown = abs(
      abs(computeDestinationPoint(latLng, -radiusM, 90).longitude) -
        abs(longitude),
    );
    const result = await this.nftBannersRepository.find({
      where: {
        latitude: Between(latitude - latDown, latitude + latUp),
        longitude: Between(longitude - lngDown, longitude + lngUp),
      },
      relations: ['creatorUser', 'ownerUser', 'tags'],
      take: this.MAX_OUTPUT_LENGTH,
    });
    return Ok(result);
  }
}
