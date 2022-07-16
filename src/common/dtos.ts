import { ObjectType } from '@nestjs/graphql';
import { Result } from './interfaces';
import { ResField } from './result/result.decorator';

@ObjectType()
export abstract class CoreOutput<Ok> implements Result<Ok, string> {
  abstract ok?: Ok;
  @ResField(() => String)
  error?: string;
}
@ObjectType()
export abstract class StringOutput extends CoreOutput<string> {
  @ResField(() => String)
  ok?: string;
}
