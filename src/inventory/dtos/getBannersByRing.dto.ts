import { ArgsType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  H3_WALKING_RESOLUTION,
  INVENTORY_MAX_OUTPUT_LENGTH,
  OrderValue,
} from 'src/common/constants';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { IsH3Index } from 'src/common/validators';
import { NftBanner } from 'src/nft/mint/entities/nftBanner.entity';
import { PartialBannerOrder } from './partialBannerOrder.dto';

@ArgsType()
export class GetBannersByH3RingInput {
  @Field(() => String)
  @IsH3Index(H3_WALKING_RESOLUTION) // <------
  h3Center: string;
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(4)
  radius: number;
  @Field(() => PartialBannerOrder, { defaultValue: { likes: 'DESC' } })
  order: PartialBannerOrder;
  @Field(() => Number, { defaultValue: INVENTORY_MAX_OUTPUT_LENGTH })
  @IsNumber()
  @Min(1)
  @Max(INVENTORY_MAX_OUTPUT_LENGTH)
  amount: number;
  @Field(() => Number, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  index: number;
}

@ObjectType()
export class GetBannersByH3RingOutput extends CoreOutput<NftBanner[]> {
  @ResField(() => [NftBanner])
  ok?: NftBanner[];
}

@ArgsType()
export class GetBannersByRingInput {
  @Field(() => Float)
  @IsLatitude()
  latitude: number;
  @Field(() => Float)
  @IsLongitude()
  longitude: number;
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(40075000) // eath circumference
  radiusM: number;
  @Field(() => PartialBannerOrder, { defaultValue: { likes: OrderValue.Desc } })
  @ValidateNested()
  order: PartialBannerOrder;
  @Field(() => Number, { defaultValue: INVENTORY_MAX_OUTPUT_LENGTH })
  @IsNumber()
  @Min(1)
  @Max(INVENTORY_MAX_OUTPUT_LENGTH)
  amount: number;
  @Field(() => Number, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  index: number;
}

@ObjectType()
export class GetBannersByRingOutput extends CoreOutput<NftBanner[]> {
  @ResField(() => [NftBanner])
  ok?: NftBanner[];
}
