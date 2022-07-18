import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, AllowUserState } from 'src/auth/allow.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { LikeNftInput, LikeNftOutput } from './dtos/likeNft.dto';
import { NftService } from './nft.service';

@Resolver()
export class NftResolver {
  constructor(private readonly nftServise: NftService) {}

  @Mutation(() => LikeNftOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['None'])
  likeNft(
    @AuthUser() user: User,
    @Args() likeNftInput: LikeNftInput,
  ): Promise<LikeNftOutput> {
    return this.nftServise.likeNft(user, likeNftInput);
  }
}
