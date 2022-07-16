import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { UserTokenAccounts } from 'src/users/entities/userTokenAccounts.entity';
import { Transactions } from 'src/users/entities/transactions.entity';
import { Web3ModuleOptions } from './web3.interface';
import { Web3Service } from './web3.service';

@Global()
@Module({})
export class Web3Module {
  static forRoot(options: Web3ModuleOptions): DynamicModule {
    return {
      module: Web3Module,
      imports: [TypeOrmModule.forFeature([UserTokenAccounts, Transactions])],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        Web3Service,
      ],
      exports: [Web3Service],
    };
  }
}
