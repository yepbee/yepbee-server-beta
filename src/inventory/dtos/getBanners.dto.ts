import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { User } from 'src/users/entities/user.entity';
import { NftBanner } from 'src/validation/entities/nftBanner.entity';

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
}

@ObjectType()
export class GetBannersOutput extends CoreOutput<NftBanner[]> {
  @ResField(() => [NftBanner])
  ok?: NftBanner[];
}
