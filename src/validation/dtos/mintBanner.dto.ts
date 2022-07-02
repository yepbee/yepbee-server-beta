import { ArgsType, Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import {
  SERVICE_TAGS_MAX_SIZE,
  SERVICE_TAG_LENGTH,
} from 'src/common/constants';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { SERVICE_DESCRIPTION_LENGTH } from '../../common/constants';
import { Weather } from '@retrip/js';

@InputType({ isAbstract: true })
@ObjectType()
export class Tag {
  @Field(() => String)
  @IsString()
  @Length(2, SERVICE_TAG_LENGTH)
  value: string;
}

@InputType({ isAbstract: true })
@ObjectType()
export class LatLng {
  @Field(() => Float)
  @IsLatitude()
  latitude: number;
  @Field(() => Float)
  @IsLongitude()
  longitude: number;
}

@ArgsType()
export class MintBannerInput {
  @Field(() => GraphQLUpload)
  file: FileUpload;

  @Field(() => String)
  @IsString()
  @Length(2, SERVICE_DESCRIPTION_LENGTH)
  description: string;

  @Field(() => [Tag], { defaultValue: [] })
  @IsArray()
  @ArrayMaxSize(SERVICE_TAGS_MAX_SIZE)
  @ValidateNested({ each: true })
  @Type(() => Tag)
  tags: Tag[];

  @Field(() => LatLng)
  @ValidateNested()
  @Type(() => LatLng)
  location: LatLng;

  @Field(() => Weather)
  @IsEnum(Weather)
  weather: Weather;

  @Field(() => Float)
  @IsNumber()
  temperatureCel: number;
}

@ObjectType()
export class MintBannerOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
