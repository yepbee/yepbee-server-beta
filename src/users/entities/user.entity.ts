import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CoreEntity } from 'src/common/entites';
import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsWalletPublicKey } from 'src/common/validators';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
} from 'class-validator';
import { nanoid } from 'nanoid';
import { ValidProperty } from './validProperty.entity';
import { RTIME_LENGTH } from 'src/rtime/rtime.constant';
import { NftBanner } from 'src/mint/entities/nftBanner.entity';
import { Transactions } from './transactions.entity';
import { AuthUserState } from 'src/common/constants';

@InputType('UserInput')
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(() => String)
  @IsString()
  @Length(RTIME_LENGTH, RTIME_LENGTH)
  @Column()
  rtime: string;

  @Field(() => ValidProperty, { nullable: true })
  @ValidateNested()
  @OneToOne(() => ValidProperty, { eager: true, cascade: true })
  @JoinColumn({ name: 'validProperty' })
  validProperty?: ValidProperty; // joined dapp peer

  @Column({ type: 'enum', enum: AuthUserState, default: AuthUserState.None })
  @Field(() => AuthUserState)
  @IsEnum(AuthUserState)
  state: AuthUserState;

  @Column({ nullable: true })
  @Field(() => String)
  @IsString()
  stateValue: string;

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
  @Column()
  nickname?: string;
  @Field(() => String, { nullable: true })
  @IsUrl()
  @Length(9, 1000)
  @Column()
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

  @Field(() => [NftBanner], { defaultValue: [] })
  @ValidateNested({ each: true })
  @OneToMany(() => NftBanner, (banner: NftBanner) => banner.creatorUser, {
    cascade: ['insert', 'update'],
  })
  createdBanners: NftBanner[];

  @Field(() => [NftBanner], { defaultValue: [] })
  @ValidateNested({ each: true })
  @OneToMany(() => NftBanner, (banner: NftBanner) => banner.ownerUser, {
    cascade: ['insert', 'update'],
  })
  ownedBanners: NftBanner[];

  @Field(() => [Transactions], { defaultValue: [] })
  @ValidateNested({ each: true })
  @OneToMany(() => Transactions, (tx: Transactions) => tx.owner, {
    cascade: true,
  })
  transactions: Transactions[];

  @BeforeInsert()
  insertDefaultValues() {
    if (!this.nickname) {
      this.nickname = `user${nanoid(6)}`;
    }
    if (!this.photoUri) {
      this.photoUri = `https://picsum.photos/id/${Math.floor(
        Math.random() * 1083 + 1,
      )}/200`;
    }
  }
}
