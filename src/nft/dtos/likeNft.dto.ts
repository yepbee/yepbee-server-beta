import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos';
import { ResField } from 'src/common/result/result.decorator';
import { IsWalletPublicKey } from 'src/common/validators';
import { Column } from 'typeorm';

@ArgsType()
export class LikeNftInput {
  @Field(() => String)
  @IsWalletPublicKey()
  @Column({ unique: true })
  mintKey: string;
}

@ObjectType()
export class LikeNftOutput extends CoreOutput<boolean> {
  @ResField(() => Boolean)
  ok?: boolean;
}
