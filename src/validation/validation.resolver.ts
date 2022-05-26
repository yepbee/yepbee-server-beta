import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow } from 'src/auth/allow.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  EnqueueValidatingInput,
  EnqueueValidatingOutput,
} from './dtos/enqueueValidating.dto';
import { ValidationService } from './validation.service';

@Resolver()
export class ValidationResolver {
  constructor(private readonly validationsServise: ValidationService) {}

  @Mutation(() => EnqueueValidatingOutput)
  @Allow(['ValidUser', 'User']) // will change
  enqueueValidating(
    @AuthUser() user: User,
    @Args() enqueueValidatingInput: EnqueueValidatingInput,
  ): Promise<EnqueueValidatingOutput> {
    return this.validationsServise.enqueueValidating(
      user,
      enqueueValidatingInput,
    );
  }
}
