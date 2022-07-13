import { Mutation, Resolver } from '@nestjs/graphql';
import { Allow, AllowUserState } from 'src/auth/allow.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Web3Service } from './web3/web3.service';
import { StringOutput } from 'src/common/dtos';

@Resolver()
export class AppResolver {
  constructor(private readonly web3Service: Web3Service) {}

  @Mutation(() => StringOutput)
  @Allow(['ValidUser'])
  @AllowUserState(['None'])
  faucet(@AuthUser() user: User): Promise<StringOutput> {
    return this.web3Service.faucet(user);
  }
}
