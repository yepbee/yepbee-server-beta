import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class TokenResolver {
  @Query(() => String)
  hello(): string {
    return 'hello';
  }
}
