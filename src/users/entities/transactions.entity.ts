import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { PureEntity } from 'src/common/entites';
import { Column, Entity } from 'typeorm';

enum TransactionType {
  Reward,
  Mint,
  Withdraw,
  Unknown,
}

registerEnumType(TransactionType, { name: 'TransactionType' });

@InputType('TransactionsInput')
@ObjectType()
@Entity()
export class Transactions extends PureEntity {
  @Column({ type: 'enum', enum: TransactionType })
  @Field(() => TransactionType)
  @IsEnum(TransactionType)
  type: TransactionType;
  @Field(() => String)
  @IsString() // * unchecked
  @Column({ unique: true })
  txhash: string;
}
