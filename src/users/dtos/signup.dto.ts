import {
  ArgsType,
  ObjectType,
  PickType,
  Field,
  IntersectionType,
  PartialType,
} from '@nestjs/graphql';
import { IsHexadecimal, Length } from 'class-validator';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { Column } from 'typeorm';
import { User } from '../entities/user.entity';

@ArgsType()
export class SignupInput extends PickType(User, ['pubkey'], ArgsType) {
  @Field(() => String)
  @IsHexadecimal()
  @Length(128, 128)
  sig: string;
  @Field(() => String)
  @IsHexadecimal()
  @Length(64, 64)
  msg: string;
}

@ObjectType()
export class SignupResult extends PickType(User, ['id', 'pubkey'], ObjectType) {
  @Field(() => String)
  accessToken: string;
}

@ObjectType()
export class SignupOutput extends CoreOutput<SignupResult> {
  @ResField(() => SignupResult)
  ok?: SignupResult;
}
