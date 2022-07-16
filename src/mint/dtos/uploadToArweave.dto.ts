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
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Weather } from '@retrip/js';
import {
  SERVICE_DESCRIPTION_LENGTH,
  SERVICE_TAGS_MAX_SIZE,
  SERVICE_TAG_LENGTH,
} from 'src/common/constants';

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

@InputType({ isAbstract: true })
@ObjectType()
export class Tag {
  @Field(() => String)
  @IsString()
  @Length(2, SERVICE_TAG_LENGTH)
  value: string;
}

@ArgsType()
export class UploadToArweaveInput {
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
