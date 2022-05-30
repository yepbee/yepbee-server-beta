import { ObjectType } from '@nestjs/graphql';
import { Result } from './interfaces';
import { ResField } from './result/result.decorator';

@ObjectType()
export abstract class CoreOutput<Ok> implements Result<Ok, string> {
  abstract ok?: Ok;
  @ResField(() => String)
  error?: string;
}
