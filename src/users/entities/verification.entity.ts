import { Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, Length } from 'class-validator';
import { PureEntity } from 'src/common/entites';
import { IsWalletPublicKey } from 'src/common/validators';
import { Column, Entity } from 'typeorm';

@ObjectType()
@Entity()
export class Verification extends PureEntity {
  @Field(() => String)
  @IsWalletPublicKey()
  @Column()
  pubkey: string; // = Id
  @Field(() => String)
  @IsEmail()
  @Column()
  email: string; // = Email
  @Field(() => String)
  @IsString()
  @Length(21, 21)
  @Column({ unique: true })
  code: string;
}
