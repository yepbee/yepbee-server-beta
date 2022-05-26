import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsString, Length, ValidateNested } from 'class-validator';
import { H3_WALKING_RESOLUTION } from 'src/common/constants';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { IsH3Index } from 'src/common/validators';
import { RTIME_LENGTH } from 'src/rtime/rtime.constant';

@InputType({ isAbstract: true })
@ObjectType()
export class EnqueueValidatingData {
  @Field(() => String)
  @IsH3Index(H3_WALKING_RESOLUTION) // <------
  h3: string;
  @Field(() => String)
  @IsString()
  @Length(RTIME_LENGTH, RTIME_LENGTH)
  rtime: string;
}

@ArgsType()
export class EnqueueValidatingInput {
  @Field(() => [EnqueueValidatingData])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnqueueValidatingData)
  data: EnqueueValidatingData[];
}

@ObjectType()
export class EnqueueValidatingOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
