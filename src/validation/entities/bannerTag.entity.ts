import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { SERVICE_TAG_LENGTH } from 'src/common/constants';
import { CoreEntity } from 'src/common/entites';
import { Entity, ManyToMany, Column } from 'typeorm';
import { NftBanner } from './nftBanner.entity';

@InputType('BannerTagInput')
@ObjectType()
@Entity()
export class BannerTag extends CoreEntity {
  @Field(() => String)
  @IsString()
  @Length(2, SERVICE_TAG_LENGTH)
  @Column()
  value: string;

  @ManyToMany(() => NftBanner, (banner: NftBanner) => banner.tags)
  banner: NftBanner;
}
