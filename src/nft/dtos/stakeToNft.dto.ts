import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsISBN } from 'class-validator';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { IsWalletPublicKey } from 'src/common/validators';
import { Column } from 'typeorm';

@ArgsType()
export class StakeToNftInput {
  @Field(() => String)
  @IsWalletPublicKey()
  @Column({ unique: true })
  mintKey: string;

  @Field(() => String)
  @IsISBN()
  @Column({ default: '0' })
  amount: string;
}

@ObjectType()
export class StakeToNftOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
