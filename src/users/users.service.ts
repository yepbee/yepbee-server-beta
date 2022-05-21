import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';
import { Repository } from 'typeorm';
import { SignupInput, SignupOutput } from './dtos/signup.dto';
import { User } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { Verification } from './entities/verification.entity';
import { EnvService } from 'src/env/env.service';
import { GLOBAL_OPTIONS } from 'src/common/constants';
import { nanoid } from 'nanoid';

@Injectable()
export class UsersService {
  constructor(
    private readonly envService: EnvService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationsRepository: Repository<Verification>,
    private readonly mailService: MailService,
  ) {}

  @AsyncTryCatch()
  async signup(pubkey: string, { email }: SignupInput): Promise<SignupOutput> {
    const code = nanoid();
    const redirectUri =
      GLOBAL_OPTIONS.baseUrl +
      this.envService
        .get('CONFIRM_URI')
        .replace('{{pubkey}}', pubkey)
        .replace('{{code}}', code);

    const user = await this.usersRepository.findOneBy([
      { pubkey },
      {
        email,
      },
    ]);
    if (user)
      return Err(
        'user already exists. ' +
          `pubkey: ${user.pubkey} / email: ${user.email}`,
      );

    await this.mailService.sendVerificationEmail(email, redirectUri);

    const verification = this.verificationsRepository.create({
      pubkey,
      email,
      code,
    });

    await this.verificationsRepository.save(verification);

    return Ok(true);
  }
}
