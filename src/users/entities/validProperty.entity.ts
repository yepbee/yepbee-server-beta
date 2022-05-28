import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { PureEntity } from 'src/common/entites';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserTokenAccounts } from './userTokenAccounts.entity';

@ObjectType()
@Entity()
export class ValidProperty extends PureEntity {
  @Field(() => String)
  @IsString()
  @Column({ unique: true })
  paymentSignature: string;
  @Field(() => UserTokenAccounts)
  @ValidateNested()
  @OneToOne(() => UserTokenAccounts, { eager: true, cascade: true })
  @JoinColumn({ name: 'internalTokenAccounts' })
  internalTokenAccounts: UserTokenAccounts; // joined dapp peer
}
