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
  }
  beforeAll<T>(...args: T[]): void {
    return;
  }
  afterAll<T>(...args: T[]): void {
    return;
  }
  beforeEach<T>(...args: T[]): void {
    return;
  }
  afterEach<T>(...args: T[]): void {
    const first = args.shift();
    if (first instanceof User) {
      first.state = this.currentService;
      this.usersRepository.save(first); // saving current state
    }
    return;
  }
  backBeforeEach<T>(...args: T[]): void {
    return;
  }
  backAfterEach<T>(...args: T[]): void {
    return;
  }
}
