import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RtimeId } from './common/constants';
import { AsyncTryCatch } from './common/decorators';
import { throwException } from './common/functions';
import { CoreResult } from './common/interfaces';
import { Ok } from './common/result/result.function';
import { EnvService } from './env/env.service';
import { RtimeService } from './rtime/rtime.service';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import {
  AccountKeys,
  MINT_ADDRESS,
  PROGRAM_ID,
  TOTALSUPPLY_ADDRESS,
  WHITELIST_ADDRESS,
} from '@retrip/js';

@Injectable()
export class AppService {
  constructor(
    private readonly envService: EnvService,
    private readonly rtimeService: RtimeService,
    @InjectRepository(Verification)
    private readonly verificationsRepository: Repository<Verification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  welcome(): string {
    return 'Welcome To Retrip! 2022.7.16 17:13';
  }

  keys(): AccountKeys {
    return {
      PROGRAM_ID,
      MINT_ADDRESS,
      TOTALSUPPLY_ADDRESS,
      WHITELIST_ADDRESS,
    };
  }

  async rtime(id: RtimeId): Promise<string> {
    if (id === RtimeId.Walking) {
      await this.rtimeService.updateAndSaveTime(id);
      return this.rtimeService.getTime(id);
    }
    return this.rtimeService.updateAndGetTime(id);
  }

  @AsyncTryCatch()
  async confirm(code: string): Promise<CoreResult> {
    const verification = await this.verificationsRepository.findOneBy({
      code,
    });
    if (!verification) throwException('Wrong Access', HttpStatus.FORBIDDEN);

    await this.verificationsRepository.delete({
      pubkey: verification.pubkey,
    });

    const { pubkey, email } = verification;

    const user = this.usersRepository.create({
      pubkey,
      email,
    });

    await this.usersRepository.save(user);

    return Ok(true);
  }
}
