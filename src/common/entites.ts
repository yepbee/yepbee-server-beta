import { Field, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export class PureEntity {
  @Field(() => Number)
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Date)
  @IsDate()
  @CreateDateColumn()
  createdAt: Date;
}

@ObjectType()
export class CoreEntity extends PureEntity {
  @Field(() => Date)
  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
