import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { User } from 'src/users/entities/user.entity';
import { NftBanner } from 'src/nft/mint/entities/nftBanner.entity';
import { INVENTORY_MAX_OUTPUT_LENGTH, OrderValue } from 'src/common/constants';
import { PartialBannerOrder } from './partialBannerOrder.dto';

@InputType()
export class PartialBannerInput extends PartialType(
  OmitType(NftBanner, ['generate', 'creatorUser', 'ownerUser']),
  InputType,
) {
  @Field(() => User, { nullable: true })
  @ValidateNested()
  creatorUser?: User;
  @Field(() => User, { nullable: true })
  @ValidateNested()
  ownerUser?: User;
}

@ArgsType()
export class GetBannersInput {
  @Field(() => [PartialBannerInput])
  @IsArray()
  @ArrayMaxSize(30) // temporary
  @ValidateNested({ each: true })
  where: PartialBannerInput[];
  @Field(() => PartialBannerOrder, {
    defaultValue: PartialBannerOrder.new({ likes: OrderValue.Desc }),
  })
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
export class GetBannersOutput extends CoreOutput<NftBanner[]> {
  @ResField(() => [NftBanner])
  ok?: NftBanner[];
}
