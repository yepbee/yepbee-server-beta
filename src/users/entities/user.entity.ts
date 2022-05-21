import { Column, Entity, Unique } from 'typeorm';
import { CoreEntity } from 'src/common/entites';
import { InputType, ObjectType, Field, ArgsType } from '@nestjs/graphql';
import { IsHash, IsHexadecimal, Length } from 'class-validator';
import { IsWalletPublicKey } from 'src/common/validators';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
@Unique(['pubkey'])
export class User extends CoreEntity {
  @Field(() => String)
  @IsWalletPublicKey()
  @Column()
  pubkey: string; // = Id
}
