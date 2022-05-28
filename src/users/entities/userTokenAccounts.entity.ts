import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { PureEntity } from 'src/common/entites';
import { Column, Entity } from 'typeorm';

@ObjectType()
@Entity()
export class UserTokenAccounts extends PureEntity {
  @Field(() => String)
  @IsString()
  @Column({ unique: true })
  tokenAccount: string; // * unchecked
  @Field(() => String)
  @IsString()
  @Column({ unique: true })
  nftTokenAccount: string; // * unchecked
}
