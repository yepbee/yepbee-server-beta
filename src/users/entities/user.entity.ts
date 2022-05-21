import { Column, Entity, Unique } from 'typeorm';
import { CoreEntity } from 'src/common/entites';
import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsWalletPublicKey } from 'src/common/validators';
import { IsEmail } from 'class-validator';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
@Unique(['pubkey', 'email'])
export class User extends CoreEntity {
  @Field(() => String)
  @IsWalletPublicKey()
  @Column({ unique: true })
  pubkey: string; // = Id
  @Field(() => String)
  @IsEmail()
  @Column({ unique: true })
  email: string; // = Email
}
