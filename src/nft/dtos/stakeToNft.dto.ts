import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { IsBN, IsWalletPublicKey } from 'src/common/validators';
import { Column } from 'typeorm';

@ArgsType()
export class StakeToNftInput {
  @Field(() => String)
  @IsWalletPublicKey()
  @Column({ unique: true })
  mintKey: string;

  @Field(() => String)
  @IsBN({ min: '1' })
  @Column({ default: '0' })
  amount: string;
}

@ObjectType()
export class StakeToNftOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
