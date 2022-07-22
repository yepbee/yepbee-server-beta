// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Transactions } from 'src/users/entities/transactions.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Repository } from 'typeorm';
// import { AuthUserState } from 'src/common/constants';
// import { AtomicService } from './state.interface';

// // ****** TODO! Remove or Refactoring ******
// @Injectable()
// export class StateService extends AtomicService<AuthUserState> {
//   constructor(
//     @InjectRepository(User) private readonly usersRepository: Repository<User>,
//     @InjectRepository(Transactions)
//     private readonly transactionsRepository: Repository<Transactions>,
//   ) {
//     super(
//       {
//         None: [AuthUserState.Waiting, AuthUserState.UploadingToArweave],
//         UploadingToArweave: [
//           AuthUserState.Waiting,
//           AuthUserState.MintingBanner,
//           AuthUserState.None,
//         ],
//         MintingBanner: [AuthUserState.Waiting, AuthUserState.None],
//         Waiting: [
//           AuthUserState.None,
//           AuthUserState.UploadingToArweave,
//           AuthUserState.MintingBanner,
//         ],
//       },
//       {
//         None: async () => () => undefined,
//         UploadingToArweave: async () => () => undefined,
//         MintingBanner: async () => () => undefined,
//         Waiting: async () => () => undefined,
//       },
//       AuthUserState.None,
//     );

//     this.usersRepository
//       .createQueryBuilder()
//       .update({ isWaiting: false })
//       .where('isWaiting = true')
//       .execute();
//     // this.usersRepository.query(
//     //   `
//     //   UPDATE "user"
//     //   SET
//     //     "state" = cast(cast("prevState" as VARCHAR) as user_state_enum),
//     //     "prevState" = '${AuthUserState.None}'
//     //   WHERE "state" = '${AuthUserState.Waiting}'
//     //   `,
//     // );

//     // ------------------------------- need to fix this
//   }
//   async afterEach(
//     currentService: AuthUserState,
//     ...args: unknown[]
//   ): Promise<void> {
//     const [user, stateValue] = args;
//     if (user && user instanceof User) {
//       user.state = currentService;
//       user.stateValue =
//         typeof stateValue === 'string' ? stateValue : user.stateValue;
//       await this.usersRepository.save(user); // saving current state
//     }
//   }
// }
