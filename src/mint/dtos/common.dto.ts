import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { AuthUserState } from 'src/common/constants';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';

@InputType({ isAbstract: true })
@ObjectType()
export class NewState {
  @Field(() => AuthUserState)
  @IsEnum(AuthUserState)
  newState: AuthUserState;
  @Field(() => String)
  @IsString()
  stateValue: string;
}

@ObjectType()
export class NewStateOutput extends CoreOutput<NewState> {
  @ResField(() => NewState)
  ok?: NewState;
}
