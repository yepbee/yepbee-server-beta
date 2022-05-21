import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as api from '@retrip/js';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';
import { Repository } from 'typeorm';
import { SignupInput, SignupOutput } from './dtos/signup.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  @AsyncTryCatch()
  async signup({ pubkey, sig, msg }: SignupInput): Promise<SignupOutput> {
    const isVerifed = api.verifyKey(pubkey, sig, msg);
    if (!isVerifed) {
      return Err('not verifed');
    }
    return Ok({
      accessToken: 'qwdqwd',
      id: 1,
      pubkey: 'Qwdwd',
    });
  }
}
