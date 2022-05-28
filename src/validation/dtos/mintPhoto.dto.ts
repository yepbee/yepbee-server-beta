import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
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

@InputType({ isAbstract: true })
@ObjectType()
export class Tag {
  @Field(() => String)
  @IsString()
  @Length(2, SERVICE_TAG_LENGTH)
  name: string;
}

@InputType({ isAbstract: true })
@ObjectType()
export class LatLng {
  @Field(() => Number)
  @IsNumber()
  latitude: number;
  @Field(() => Number)
  @IsNumber()
  longitude: number;
}

@ArgsType()
export class MintPhotoInput {
  @Field(() => GraphQLUpload)
  file: FileUpload;

  @Field(() => String)
  @IsString()
  @Length(2, SERVICE_DESCRIPTION_LENGTH)
  description: string;

  @Field(() => [Tag])
  @IsArray()
  @ArrayMaxSize(SERVICE_TAGS_MAX_SIZE)
  @ValidateNested({ each: true })
  @Type(() => Tag)
  tags: Tag[];

  @Field(() => LatLng)
  location: LatLng;
}

@ObjectType()
export class MintPhotoOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
