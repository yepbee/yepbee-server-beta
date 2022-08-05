import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { OrderValue } from 'src/common/constants';

@InputType('PartialBannerOrder')
@ObjectType()
export class PartialBannerOrder {
  static new(obj: PartialBannerOrder): PartialBannerOrder {
    return obj;
  }
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  id?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  createdAt?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  updatedAt?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  txhash?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  mintKey?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  likes?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  stakes?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  version?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  name?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  tokenId?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  symbol?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  latitude?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  longitude?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  h3?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  weather?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  royalty?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  edition?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  description?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  temperatureCel?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  metadataUrl?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  imageUrl?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  externalUrl?: OrderValue;
  @Field(() => OrderValue, { nullable: true })
  @IsEnum(OrderValue)
  animationUrl?: OrderValue;
}
