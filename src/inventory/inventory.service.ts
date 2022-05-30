import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { kRing } from 'h3-js';
import { AsyncTryCatch } from 'src/common/decorators';
import { Ok } from 'src/common/result/result.function';
import { NftBanner } from 'src/validation/entities/nftBanner.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GetBannersInput, GetBannersOutput } from './dtos/getBanners.dto';
import {
  GetBannersByRingInput,
  GetBannersByRingOutput,
} from './dtos/getBannersByRing.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(NftBanner)
    private readonly nftBannersRepository: Repository<NftBanner>,
  ) {}

  @AsyncTryCatch()
  async getBanners({ where }: GetBannersInput): Promise<GetBannersOutput> {
    const result = await this.nftBannersRepository.find({
      where: where as FindOptionsWhere<NftBanner>[],
      relations: ['creatorUser', 'ownerUser'],
    });
    return Ok(result);
  }

  @AsyncTryCatch()
  async getBannersByRing({
    h3Center,
    radius,
  }: GetBannersByRingInput): Promise<GetBannersByRingOutput> {
    const h3s = kRing(h3Center, radius).map((h3) => ({ h3 }));
    const result = await this.nftBannersRepository.find({
      where: h3s,
      relations: ['creatorUser', 'ownerUser'],
    });
    return Ok(result);
  }
}
