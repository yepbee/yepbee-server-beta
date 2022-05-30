import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { RtimeId } from 'src/common/constants';
import { stringToSnakeCase } from 'src/common/functions';
import { RTIME_LENGTH } from '../rtime.constant';

registerEnumType(RtimeId, { name: 'RtimeId' });

@Entity()
@ObjectType()
export class RtimeEntity {
  @Column({ type: 'enum', enum: RtimeId })
  @Field(() => RtimeId)
  @IsEnum(RtimeId)
  rtimeId: RtimeId;
  @Field(() => Number)
  @IsNumber()
  @PrimaryColumn()
  unixTime: number;
  @Field(() => String)
  @IsString()
  @Length(RTIME_LENGTH, RTIME_LENGTH)
  @PrimaryColumn() // 중복돼서 에러를 내뱉을 경우도 나중 처리
  rtime: string;
}

export const TABLE_NAME = stringToSnakeCase(RtimeEntity.name);
export const COLUMN_NAME_UNIX_TIME = 'unixTime';
export const COLUMN_NAME_RTIME_ID = 'rtimeId';

export const TABLE_UNIXTIME = `${TABLE_NAME}.${COLUMN_NAME_UNIX_TIME}`;
export const TABLE_RTIMEID = `${TABLE_NAME}.${COLUMN_NAME_RTIME_ID}`;
