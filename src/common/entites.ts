import { Field, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export class CoreEntity {
  @Field(() => Number)
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Date)
  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
