import { ArgsType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { User } from '../entities/user.entity';

@ArgsType()
export class EditProfileInput extends PartialType(
  PickType(User, ['nickname', 'photoUri', 'bio'], ArgsType),
) {}

@ObjectType()
export class EditProfileOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
