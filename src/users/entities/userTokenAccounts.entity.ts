import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { PureEntity } from 'src/common/entites';
import { Column, Entity } from 'typeorm';

@InputType('UserTokenAccountsInput')
@ObjectType()
@Entity()
export class UserTokenAccounts extends PureEntity {
  @Field(() => String)
  @IsString()
  @Column({ unique: true })
  tokenAccount: string; // * unchecked
}
