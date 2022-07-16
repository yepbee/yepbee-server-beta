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
      {
        None: [AuthUserState.UploadingToArweave],
        UploadingToArweave: [AuthUserState.MintingBanner, AuthUserState.None],
        MintingBanner: [AuthUserState.None],
      },
      {
        None: async () => () => undefined,
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
    if (user && user instanceof User && typeof stateValue === 'string') {
      user.state = currentService;
      user.stateValue = stateValue;
      await this.usersRepository.save(user); // saving current state
    }
  }
}
