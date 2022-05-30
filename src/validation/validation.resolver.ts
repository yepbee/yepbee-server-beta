import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow } from 'src/auth/allow.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  EnqueueValidatingInput,
  EnqueueValidatingOutput,
} from './dtos/enqueueValidating.dto';
import { MintBannerInput, MintBannerOutput } from './dtos/mintBanner.dto';
import { ValidationService } from './validation.service';

@Resolver()
export class ValidationResolver {
  constructor(private readonly validationsServise: ValidationService) {}

  @Mutation(() => EnqueueValidatingOutput)
  @Allow(['ValidUser']) // will change
  enqueueValidating(
    @AuthUser() user: User,
    @Args() enqueueValidatingInput: EnqueueValidatingInput,
  ): Promise<EnqueueValidatingOutput> {
    return this.validationsServise.enqueueValidating(
      user,
      enqueueValidatingInput,
    );
  }

  @Mutation(() => MintBannerOutput)
  @Allow(['ValidUser'])
  mintBanner(
    @AuthUser() user: User,
    @Args() mintBannerInput: MintBannerInput,
  ): Promise<MintBannerOutput> {
    return this.validationsServise.mintBanner(user, mintBannerInput);
  }
}
