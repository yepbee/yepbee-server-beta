import { Column, Entity, JoinTable, ManyToMany, Unique } from 'typeorm';
import { CoreEntity } from 'src/common/entites';
import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsWalletPublicKey } from 'src/common/validators';
import { IsEmail, IsHash, IsString, IsUrl, Length } from 'class-validator';
import { nanoid } from 'nanoid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
@Unique(['pubkey', 'email'])
export class User extends CoreEntity {
  @Field(() => String)
  @IsHash('sha256')
  @Column({ unique: true, nullable: true })
  joinedTx?: string; // joined dapp peer

  @Field(() => String)
  @IsWalletPublicKey()
  @Column({ unique: true })
  pubkey: string; // = Id
  @Field(() => String)
  @IsEmail()
  @Column({ unique: true })
  email: string; // = Email
  @Field(() => String, { nullable: true })
  @IsString()
  @Length(0, 20)
  @Column({ default: `user${nanoid(6)}` })
  nickname?: string;
  @Field(() => String, { nullable: true })
  @IsUrl()
  @Length(9, 1000)
  @Column({ default: 'https://picsum.photos/200' })
  photoUri?: string;
  @Field(() => String, { nullable: true })
  @IsString()
  @Length(0, 1000)
  @Column({ default: 'please write down your bio' })
  bio?: string;

  @ManyToMany(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinTable({ joinColumn: { name: 'followers' } })
  followers: User[];
  @ManyToMany(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinTable({ inverseJoinColumn: { name: 'following' } })
  following: User[];
}
