import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';

@ArgsType()
export class SignupChainUserInput {
  @Field(() => String)
  @IsString()
  paymentSignature: string;
}

@ObjectType()
export class SignupChainUserOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
