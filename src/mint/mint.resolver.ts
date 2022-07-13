import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, AllowUserState } from 'src/auth/allow.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { NewStateOutput } from './dtos/common.dto';
import { UploadToArweaveInput } from './dtos/uploadToArweave.dto';
import { MintService } from './mint.service';

@Resolver()
export class MintResolver {
  constructor(private readonly mintsServise: MintService) {}

  /*
    1. uploadingPhotoToArweave && uploadingMetadataToArweave
    2. mintingBanner
  */

  @Mutation(() => NewStateOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['None'])
  uploadToArweave(
    @AuthUser() user: User,
    @Args() uploadToArweaveInput: UploadToArweaveInput,
  ): Promise<NewStateOutput> {
    return this.mintsServise.uploadToArweave(user, uploadToArweaveInput);
  }

  @Mutation(() => NewStateOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['UploadingToArweave'])
  mintBanner(@AuthUser() user: User): Promise<NewStateOutput> {
    return this.mintsServise.mintBanner(user);
  }

  @Mutation(() => NewStateOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['MintingBanner'])
  cacheBanner(@AuthUser() user: User): Promise<NewStateOutput> {
    return this.mintsServise.mintBanner(user);
  }
}
