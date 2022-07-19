import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { TokenSymbol, Weather } from '@retrip/js';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
} from 'class-validator';
import { geoToH3 } from 'h3-js';
import {
  H3_WALKING_RESOLUTION,
  SERVICE_DESCRIPTION_LENGTH,
  SERVICE_TAGS_MAX_SIZE,
} from 'src/common/constants';
import { CoreEntity } from 'src/common/entites';
import { IsH3Index } from 'src/common/validators';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BannerTag } from './bannerTag.entity';

@InputType('NftBannerInput')
@ObjectType()
@Entity()
export class NftBanner extends CoreEntity {
  @Field(() => String)
  @IsString() // * unchecked
  @Column({ unique: true })
  txhash: string;
  @Field(() => String)
  @IsString() // * unchecked
  @Column({ unique: true })
  mintKey: string;
  @Field(() => Number, { defaultValue: 0 })
  @IsNumber()
  @Column({ default: 0 })
  likes: number;

  @Field(() => Number)
  @IsNumber()
  @Length(1, 1)
  @Column()
  version: number;
  @Field(() => String, { nullable: true })
  @IsString()
  @Column()
  name?: string;
  @Field(() => Number)
  @IsNumber()
  @Column()
  tokenId: number;
  @Column({ type: 'enum', enum: TokenSymbol })
  @Field(() => TokenSymbol)
  @IsEnum(TokenSymbol)
  symbol: TokenSymbol;

  @Field(() => Float)
  @IsLatitude()
  @Column({ type: 'float' })
  latitude: number;
  @Field(() => Float)
  @IsLongitude()
  @Column({ type: 'float' })
  longitude: number;

  @Field(() => String, { nullable: true })
  @IsH3Index(H3_WALKING_RESOLUTION) // <------
  @Column()
  h3?: string;

  @Column({ type: 'enum', enum: Weather })
  @Field(() => Weather)
  @IsEnum(Weather)
  weather: Weather;

  @Field(() => [BannerTag], { defaultValue: [] })
  @ArrayMaxSize(SERVICE_TAGS_MAX_SIZE)
  @ValidateNested({ each: true })
  @ManyToMany(() => BannerTag, (tag: BannerTag) => tag.banner, {
    cascade: true,
  })
  @JoinTable()
  tags: BannerTag[];

  @Field(() => User)
  @ValidateNested()
  @Type(() => User)
  @ManyToOne(() => User, (user: User) => user.createdBanners, {
    cascade: ['insert', 'update'],
  })
  creatorUser: User;

  @Field(() => User)
  @ValidateNested()
  @Type(() => User)
  @ManyToOne(() => User, (user: User) => user.ownedBanners, {
    cascade: ['insert', 'update'],
  })
  ownerUser: User;

  @Field(() => Number, { defaultValue: 5 })
  @IsNumber()
  @Length(0, 20)
  @Column({ default: 5 })
  royalty: number;

  @Field(() => String, { defaultValue: 'retrip' })
  @IsString()
  @Column({ default: 'retrip' })
  edition: string;

  @Field(() => String)
  @IsString()
  @Length(2, SERVICE_DESCRIPTION_LENGTH)
  @Column()
  description: string;

  @Field(() => Float)
  @IsNumber()
  @Column({ type: 'float' })
  temperatureCel: number;

  @Field(() => String)
  @IsUrl()
  @Column()
  metadataUrl: string;

  @Field(() => String)
  @IsUrl()
  @Column()
  imageUrl: string;

  @Field(() => String, { nullable: true })
  @IsUrl()
  @Column({ nullable: true })
  externalUrl?: string;

  @Field(() => String, { nullable: true })
  @IsUrl()
  @Column({ nullable: true })
  animationUrl?: string;

  @BeforeInsert()
  @BeforeUpdate()
  generate() {
    this.h3 = geoToH3(this.latitude, this.longitude, H3_WALKING_RESOLUTION);
    this.name = `banner-v${this.version}-${this.tokenId}-${this.h3}:${H3_WALKING_RESOLUTION}`;
    this.temperatureCel = +this.temperatureCel.toFixed(2);
  }
}
