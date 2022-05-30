import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { H3_WALKING_RESOLUTION } from 'src/common/constants';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { IsH3Index } from 'src/common/validators';
import { NftBanner } from 'src/validation/entities/nftBanner.entity';

@ArgsType()
export class GetBannersByRingInput {
  @Field(() => String)
  @IsH3Index(H3_WALKING_RESOLUTION) // <------
  h3Center: string;
  @Field(() => Int)
  @IsInt()
  radius: number;
}

@ObjectType()
export class GetBannersByRingOutput extends CoreOutput<NftBanner[]> {
  @ResField(() => [NftBanner])
  ok?: NftBanner[];
}
