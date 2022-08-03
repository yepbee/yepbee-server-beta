import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Allow, AllowUserState } from 'src/auth/allow.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthUserState, TransactionType } from 'src/common/constants';
import { connectStates, doOnce, doPayable } from 'src/common/functions';
import { Err, Ok } from 'src/common/result/result.function';
import { User } from 'src/users/entities/user.entity';
import { Web3Service } from 'src/web3/web3.service';
import { Repository } from 'typeorm';
import { NewStateOutput } from './dtos/common.dto';
import { UploadToArweaveInput } from './dtos/uploadToArweave.dto';
import { MintService } from './mint.service';
import { Result } from '../../common/interfaces';

@Resolver()
export class MintResolver {
  constructor(
    private readonly mintsServise: MintService,
    private readonly web3Service: Web3Service,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private returnNewState<R extends Result<any, any>>(
    result: R,
    newState: keyof typeof AuthUserState,
  ): NewStateOutput {
    return result.error
      ? Err(result.error)
      : Ok({
          newState: AuthUserState[newState],
          stateValue: result.ok,
        });
  }

  /*
    1. uploadingPhotoToArweave && uploadingMetadataToArweave
    2. mintingBanner
  */

  @Mutation(() => NewStateOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['None'])
  async uploadToArweave(
    @AuthUser() user: User,
    @Args() uploadToArweaveInput: UploadToArweaveInput,
  ): Promise<NewStateOutput> {
    return this.returnNewState(
      await doOnce(user, this.usersRepository, () =>
        connectStates(
          user,
          this.usersRepository,
          () =>
            doPayable(
              user,
              this.web3Service,
              () =>
                this.mintsServise.uploadToArweave(user, uploadToArweaveInput), // upload
              {
                payType: TransactionType.Upload,
                payAmount: this.mintsServise.YEPB_PER_UPLOADING_ARWEAVE,
              },
            ),
          {
            from: 'UploadingToArweave',
            to: 'MintingBanner',
          },
        ),
      ),
      'MintingBanner',
    );
  }

  @Mutation(() => NewStateOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['MintingBanner'])
  async mintBanner(@AuthUser() user: User): Promise<NewStateOutput> {
    return this.returnNewState(
      await doOnce(user, this.usersRepository, () =>
        connectStates(
          user,
          this.usersRepository,
          () =>
            doPayable(
              user,
              this.web3Service,
              () => this.mintsServise.mintBanner(user), // mint
              {
                payType: TransactionType.Mint,
                payAmount: this.mintsServise.YEPB_PER_MINTING_BANNER,
              },
            ),
          {
            to: 'CachingBanner',
          },
        ),
      ),
      'CachingBanner',
    );
  }

  @Mutation(() => NewStateOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['CachingBanner'])
  async cacheBanner(@AuthUser() user: User): Promise<NewStateOutput> {
    return this.returnNewState(
      await doOnce(user, this.usersRepository, () =>
        connectStates(
          user,
          this.usersRepository,
          () => this.mintsServise.cacheBanner(user), // cache
          {
            to: 'None',
          },
        ),
      ),
      'None',
    );
  }

  @Mutation(() => NewStateOutput)
  @Allow(['ValidUser'])
  // @AllowUserState(['UploadingToArweave'])
  @AllowUserState(['UploadingToArweave', 'MintingBanner'])
  async cancelMinting(@AuthUser() user: User): Promise<NewStateOutput> {
    return this.returnNewState(
      await doOnce(user, this.usersRepository, () =>
        connectStates(
          user,
          this.usersRepository,
          () => this.mintsServise.cancelMinting(user), // cancel
          {
            to: 'None',
          },
        ),
      ),
      'None',
    );
  }
}
