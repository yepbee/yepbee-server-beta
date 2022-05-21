import { ArgsType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos';
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
export class SignupOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
