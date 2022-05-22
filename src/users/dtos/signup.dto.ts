import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { Result } from 'src/common/interfaces';
import { ResField } from 'src/common/result/result.decorator';
import { User } from '../entities/user.entity';
import { Verification } from '../entities/verification.entity';

@ArgsType()
export class SignupInput extends PickType(Verification, ['email'], ArgsType) {}

@ObjectType()
export class SignupResult extends PickType(
  User,
  ['id', 'pubkey'],
  ObjectType,
) {}

@ObjectType()
export class SignupError {
  @Field(() => String)
  msg: string;
  @Field(() => String, { nullable: true })
  pubkey?: string;
  @Field(() => String, { nullable: true })
  email?: string;
}

@ObjectType()
export class SignupOutput implements Result<boolean, SignupError> {
  @ResField(() => Boolean)
  ok?: boolean;
  @ResField(() => SignupError)
  error?: SignupError;
}
