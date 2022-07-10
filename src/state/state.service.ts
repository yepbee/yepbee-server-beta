import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions } from 'src/users/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserState } from './state.constant';
import { AtomicService } from './state.interface';

@Injectable()
export class StateService extends AtomicService<UserState> {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
  ) {
    super(
      {
        None: [
          UserState.None,
          UserState.RecordingTransaction,
          UserState.BuyingBasket,
          UserState.MoveMode,
          UserState.ExploreMode,
          UserState.ValidatingHoneycon,
          UserState.UploadingPhotoToArweave,
        ],
        RecordingTransaction: [UserState.None],
        BuyingBasket: [UserState.RecordingTransaction],
        MoveMode: [UserState.None, UserState.ExploreMode],
        ExploreMode: [UserState.None, UserState.MoveMode],
        ValidatingHoneycon: [UserState.None],
        // ------- Minting -------
        UploadingPhotoToArweave: [UserState.UploadingMetadataToArweave],
        UploadingMetadataToArweave: [UserState.MintingBanner],
        MintingBanner: [UserState.RecordingTransaction],
      },
      {
        None: async () => () => undefined,
        RecordingTransaction: async (transaction: Transactions) => {
          const genesisTx = this.transactionsRepository.create(transaction);
          await this.transactionsRepository.save(genesisTx);
          return async () => {
            await this.transactionsRepository.delete(transaction.id);
          };
        },
        BuyingBasket: async () => () => undefined,
        MoveMode: async () => () => undefined,
        ExploreMode: async () => () => undefined,
        ValidatingHoneycon: async () => () => undefined,
        UploadingPhotoToArweave: async () => () => undefined,
        UploadingMetadataToArweave: async () => () => undefined,
        MintingBanner: async () => () => undefined,
      },
      UserState.None,
    );
    // ------------------------------- need to fix this
  }
  async afterEach(...args: unknown[]): Promise<void> {
    const first = args.shift();
    if (first instanceof User) {
      first.state = this.currentService;
      await this.usersRepository.save(first); // saving current state
    }
  }
}
