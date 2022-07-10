import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  UserState,
  userStateAdjacencyList,
  userStateServices,
} from './state.constant';
import { AtomicService } from './state.interface';

@Injectable()
export class StateService extends AtomicService<UserState> {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {
    super(userStateAdjacencyList, userStateServices, UserState.None);
    this.next(UserState.ExploreMode, 23);
  }
  async afterEach(...args: unknown[]): Promise<void> {
    const first = args.shift();
    if (first instanceof User) {
      first.state = this.currentService;
      await this.usersRepository.save(first); // saving current state
    }
  }
}
