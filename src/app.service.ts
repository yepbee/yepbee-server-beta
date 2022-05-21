import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsyncTryCatch } from './common/decorators';
import { CoreResult } from './common/interfaces';
import { Ok } from './common/result/result.function';
import { EnvService } from './env/env.service';
import { RtimeService } from './rtime/rtime.service';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';

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
    return 'Welcome To Retrip!';
  }
  rtime(): string {
    return this.rtimeService.getTime();
  }

  @AsyncTryCatch()
  async confirm(code: string): Promise<CoreResult> {
    const verification = await this.verificationsRepository.findOneBy({
      code,
    });
    if (!verification)
      throw new HttpException('Wrong Access', HttpStatus.FORBIDDEN);

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
