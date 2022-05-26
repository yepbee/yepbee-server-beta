import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';
import { Repository } from 'typeorm';
import { SignupError, SignupInput, SignupOutput } from './dtos/signup.dto';
import { User } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { Verification } from './entities/verification.entity';
import { EnvService } from 'src/env/env.service';
import { bs58, GLOBAL_OPTIONS, RtimeId } from 'src/common/constants';
import { RtimeService } from 'src/rtime/rtime.service';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import {
  SignupChainUserInput,
  SignupChainUserOutput,
} from './dtos/signupChainUser.dto';
import { Web3Service } from 'src/web3/web3.service';
import { ValidProperty } from './entities/validProperty.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly envService: EnvService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationsRepository: Repository<Verification>,
    @InjectRepository(ValidProperty)
    private readonly validPropertysRepository: Repository<ValidProperty>,
    private readonly mailService: MailService,
    private readonly rtimeService: RtimeService,
    private readonly web3Service: Web3Service,
  ) {}

  @AsyncTryCatch()
  async editProfile(
    editProfileInput: EditProfileInput,
    user: User,
  ): Promise<EditProfileOutput> {
    const assigned = Object.assign(user, editProfileInput);
    await this.usersRepository.save(assigned);
    return Ok(true);
  }

  @AsyncTryCatch<SignupError>({
    errValue: (msg) => ({
      msg,
    }),
  })
  async signup(
    { email }: SignupInput,
    pubkey: string,
    rtime: string,
  ): Promise<SignupOutput> {
    const user = this.usersRepository.create({
      pubkey,
      email,
      rtime,
    });

    await this.usersRepository.save(user);

    // const code = nanoid();
    // const redirectUri =
    //   GLOBAL_OPTIONS.getOne('baseUrl') +
    //   this.envService
    //     .get('CONFIRM_URI')
    //     .replace('{{pubkey}}', pubkey)
    //     .replace('{{code}}', code);

    // const user = await this.usersRepository.findOneBy([
    //   { pubkey },
    //   {
    //     email,
    //   },
    // ]);
    // if (user)
    //   return Err({
    //     msg: 'user already exists.',
    //     pubkey: user.pubkey,
    //     email: user.email,
    //   });

    // await this.mailService.sendVerificationEmail(email, redirectUri);

    // const verification = this.verificationsRepository.create({
    //   pubkey,
    //   email,
    //   code,
    // });

    // await this.verificationsRepository.save(verification);

    return Ok(true);
  }

  @AsyncTryCatch()
  async signupChainUser(
    { paymentSignature }: SignupChainUserInput,
    user: User,
  ): Promise<SignupChainUserOutput> {
    if (user.validProperty) return Err(`User Already Signed`);

    // get transaction
    const { transaction: { message } = {} } =
      await this.web3Service.getTransaction(paymentSignature);

    console.dir(message, { depth: null });

    // extract information
    const { fromPubkey, lamports, toPubkey } =
      this.web3Service.decodeTransferTransaction(
        this.web3Service.newTransactionInstruction({
          data: Buffer.from(bs58.decode(message.instructions[0].data)),
          keys: [
            {
              pubkey: message.accountKeys[0],
              isSigner: true,
              isWritable: true,
            },
            {
              pubkey: message.accountKeys[1],
              isSigner: false,
              isWritable: true,
            },
          ],
          programId: message.accountKeys[2],
        }),
      );

    if (!fromPubkey || !lamports || !toPubkey) {
      return Err(
        `This signature has no fromPubkey ${fromPubkey} or toPubkey ${toPubkey} or lamports ${lamports}`,
      );
    }

    if (lamports.toString() !== this.envService.get('SERVICE_MEMBERSHIP_FEE')) {
      return Err(
        `Unexpected Amount Value : ${lamports.toString()} (expected ${this.envService.get(
          'SERVICE_MEMBERSHIP_FEE',
        )})`,
      );
    }

    const sender = fromPubkey.toString();

    if (sender !== user.pubkey) {
      return Err(
        `Unexpected Sender Public Key : ${sender} (expected ${user.pubkey})`,
      );
    }

    const receiver = toPubkey.toString();
    const masterPubkey = this.web3Service.masterPubkey.toString();

    if (receiver !== masterPubkey) {
      return Err(
        `Unexpected Receiver Public Key : ${receiver} (expected ${masterPubkey})`,
      );
    }

    const tokenAccount = await this.web3Service.createUserTokenAccount(
      user.pubkey,
    );
    const validProperty = this.validPropertysRepository.create({
      paymentSignature,
      internalTokenAccount: tokenAccount.toString(),
    });

    user['validProperty'] = validProperty;

    await this.usersRepository.save(user);

    return Ok(true);
  }
}
