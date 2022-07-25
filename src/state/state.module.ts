import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { User } from 'src/users/entities/user.entity';
import { Transactions } from 'src/users/entities/transactions.entity';
import { StateModuleOptions } from './state.interface';
// import { StateService } from './state.service';

@Global()
@Module({})
export class StateModule {
  static forRoot(options: StateModuleOptions = { test: '' }): DynamicModule {
    return {
      module: StateModule,
      imports: [TypeOrmModule.forFeature([User, Transactions])],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        // StateService,
      ],
      // exports: [StateService],
    };
  }
}
