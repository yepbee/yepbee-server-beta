import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PureEntity } from 'src/common/entites';
import { IsWalletPublicKey } from 'src/common/validators';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  Reward,
  Mint,
  Withdraw,
  System,
  Unknown,
}

registerEnumType(TransactionType, { name: 'TransactionType' });

export enum CurrencyType {
  Sol,
  RTRP,
}

registerEnumType(CurrencyType, { name: 'CurrencyType' });

@InputType('TransactionsInput')
@ObjectType()
@Entity()
export class Transactions extends PureEntity {
  @Field(() => CurrencyType)
  @IsEnum(CurrencyType)
  @Column({ type: 'enum', enum: CurrencyType })
  currency: CurrencyType;

  @Field(() => TransactionType)
  @IsEnum(TransactionType)
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;
  @Field(() => String)
  @IsString() // * unchecked
  @Column({ unique: true })
  txhash: string;

  @Field(() => String)
  @IsWalletPublicKey()
  @Column()
  from: string;
  @Field(() => String)
  @IsWalletPublicKey()
  @Column()
  to: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Column({ type: 'float' })
  amount: number;

  @Field(() => User)
  @ValidateNested()
  @Type(() => User)
  @ManyToOne(() => User, (user: User) => user.transactions, {
    cascade: ['insert', 'update'],
  })
  owner: User;

  @BeforeInsert()
  @BeforeUpdate()
  validateTransactions() {
    const pubkey = this.owner.pubkey;
    const tokenAccount =
      this.owner.validProperty?.internalTokenAccounts?.tokenAccount;
    if (
      this.from !== pubkey &&
      this.from !== tokenAccount &&
      this.to !== pubkey &&
      this.to !== tokenAccount
    ) {
      throw new Error(`Invalid transaction for ${pubkey}`);
    }
  }
}
