import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions } from 'src/users/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthUserState } from 'src/common/constants';
import { AtomicService } from './state.interface';

@Injectable()
export class StateService extends AtomicService<AuthUserState> {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
  ) {
    super(
      // {
      // None: [
      // AuthUserState.None,
      // AuthUserState.RecordingTransaction,
      // AuthUserState.BuyingBasket,
      // AuthUserState.ValidatingHoneycon,
      // AuthUserState.UploadingPhotoToArweave,
      // ],
      // RecordingTransaction: [AuthUserState.None],
      // BuyingBasket: [AuthUserState.RecordingTransaction],
      // ValidatingHoneycon: [AuthUserState.None],
      // ------- Minting -------
      // UploadingPhotoToArweave: [AuthUserState.UploadingMetadataToArweave],
      // UploadingMetadataToArweave: [AuthUserState.MintingBanner],
      //   UploadingToArweave: [AuthUserState.MintingBanner],
      //   MintingBanner: [AuthUserState.RecordingTransaction],
      // },
      {
        None: [AuthUserState.UploadingToArweave],
        UploadingToArweave: [AuthUserState.MintingBanner],
        MintingBanner: [AuthUserState.None],
      },
      {
        None: async () => () => undefined,
        /**
          async (user: User, transaction: Transactions) => {
            const genesisTx = this.transactionsRepository.create(transaction);
            await this.transactionsRepository.save(genesisTx);
            return async () => {
              await this.transactionsRepository.delete(transaction.id);
            };
          },
         */
        UploadingToArweave: async () => () => undefined,
        MintingBanner: async () => () => undefined,
      },
      AuthUserState.None,
    );
    // ------------------------------- need to fix this
  }
  async afterEach(
    currentService: AuthUserState,
    ...args: unknown[]
  ): Promise<void> {
    const [user, stateValue] = args;
    if (
      user &&
      stateValue &&
      user instanceof User &&
      typeof stateValue === 'string'
    ) {
      user.state = currentService;
      user.stateValue = stateValue;
      await this.usersRepository.save(user); // saving current state
    }
  }
}
