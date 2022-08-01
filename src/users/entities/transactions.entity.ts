import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { CurrencyType, TransactionType } from 'src/common/constants';
import { PureEntity } from 'src/common/entites';
import { IsBN, IsWalletPublicKey } from 'src/common/validators';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

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

  @Field(() => String)
  @IsBN()
  @Column({ default: '0' })
  amount: string;

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
      this.owner == null ||
      (this.from !== pubkey &&
        this.from !== tokenAccount &&
        this.to !== pubkey &&
        this.to !== tokenAccount)
    ) {
      throw new Error(`Invalid transaction for ${pubkey}`);
    }
  }
}
