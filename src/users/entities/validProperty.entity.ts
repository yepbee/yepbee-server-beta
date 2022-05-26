import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { PureEntity } from 'src/common/entites';
import { Column, Entity } from 'typeorm';

@ObjectType()
@Entity()
export class ValidProperty extends PureEntity {
  @Field(() => String)
  @IsString()
  @Column({ unique: true })
  paymentSignature: string;
  @Field(() => String)
  @Column({ unique: true })
  internalTokenAccount: string;
}
