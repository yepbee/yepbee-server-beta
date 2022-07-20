import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, AllowUserState } from 'src/auth/allow.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { LikeNftInput, LikeNftOutput } from './dtos/likeNft.dto';
import { StakeToNftInput, StakeToNftOutput } from './dtos/stakeToNft.dto';
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

  @Mutation(() => StakeToNftOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['None'])
  stakeToNft(
    @AuthUser() user: User,
    @Args() stakeToNftInput: StakeToNftInput,
  ): Promise<LikeNftOutput> {
    return this.nftServise.stakeToNft(user, stakeToNftInput);
  }

  @Mutation(() => StakeToNftOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['None'])
  unstakeToNft(
    @AuthUser() user: User,
    @Args() unstakeToNftInput: StakeToNftInput,
  ): Promise<LikeNftOutput> {
    return this.nftServise.unstakeToNft(user, unstakeToNftInput);
  }
}
