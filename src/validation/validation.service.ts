import { Inject, Injectable } from '@nestjs/common';
import {
  CurrencyType,
  KEY_OPTIONS,
  TransactionType,
} from 'src/common/constants';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';
import { User } from 'src/users/entities/user.entity';
import { VerificationService } from 'src/verification/verification.service';
import {
  EnqueueValidatingInput,
  EnqueueValidatingOutput,
} from './dtos/enqueueValidating.dto';
import { h3IndexesAreNeighbors } from 'h3-js';
import { ValidationModuleOptions } from './validation.interface';
import { Web3Service } from 'src/web3/web3.service';
import { EnvService } from 'src/env/env.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactions } from 'src/users/entities/transactions.entity';

@Injectable()
export class ValidationService {
  readonly TD_MIN: number;
  readonly TD_MAX: number;
  readonly RD_MAX: number;
  readonly RTRP_PER_HONEYCON: number;
  readonly TEMPERATURE_MIN: number;
  readonly TEMPERATURE_MAX: number;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: ValidationModuleOptions,
    private readonly envsService: EnvService,
    private readonly varificationsService: VerificationService,
    private readonly web3Service: Web3Service,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
  ) {
    this.TD_MIN = this.options.timeDistanceMinBoundary;
    this.TD_MAX = this.options.timeDistanceMaxBoundary;
    this.RD_MAX = this.options.rewardsOnedayMax;
    this.RTRP_PER_HONEYCON = this.options.rtrpPerHoneycon;
    this.TEMPERATURE_MIN = -99.0;
    this.TEMPERATURE_MAX = 99.0;
  }

  // 요청 전달 최소 양 넣기
  @AsyncTryCatch()
  async enqueueValidating(
    user: User,
    { data }: EnqueueValidatingInput,
  ): Promise<EnqueueValidatingOutput> {
    const {
      validProperty: { internalTokenAccounts: { tokenAccount } = {} } = {},
    } = user;
    // double check: valid user
    if (!tokenAccount) return Err(`Forbidden user request`);

    if (data.length > this.RD_MAX)
      return Err(`The daily reward must be less than ${this.RD_MAX}`);

    const rtimes = await this.varificationsService.findAndMapAllRtimes(data);

    if (rtimes.length <= 1)
      return Err(`Valid data length must be longer than 1`);

    let rewards = 0;

    for (let prevRtime = rtimes[0], i = 1; i < rtimes.length; i++) {
      const currRtime = rtimes[i];
      if (!currRtime) continue;

      if (h3IndexesAreNeighbors(prevRtime.h3, currRtime.h3) === false) {
        return Err(`Invalid neighbor h3 : ${currRtime.h3} (<-${prevRtime.h3})`);
      }

      const timeDistance = currRtime.unixTime - prevRtime.unixTime;

      if (timeDistance <= this.TD_MIN && this.TD_MAX <= timeDistance) {
        // return Err(
        //   `Invalid time distance : ${this.TD_MAX} <= ${timeDistance} <= ${this.TD_MIN}`,
        // );
        rewards++;
      }

      prevRtime = currRtime;
    }

    if (rewards === 0) return Err(`0 reward`);

    let txhash: string;
    try {
      txhash = await this.web3Service.transferSystemToken(
        this.web3Service.newPublicKey(tokenAccount),
        this.RTRP_PER_HONEYCON * rewards,
      );
    } catch (e) {
      // records errors
      throw e;
    }

    console.log('recording the transaction...');
    const tx = this.transactionsRepository.create({
      owner: user,
      currency: CurrencyType.RTRP,
      txhash,
      from: this.web3Service.masterPubkey.toString(),
      to: user.pubkey,
      amount: (this.RTRP_PER_HONEYCON * rewards).toString(),
      type: TransactionType.Reward,
    });

    // tx.createdAt  <--- need to work 1 month period clearing
    // 솔라나 가격이 오를 경우 무브 보상량을 줄여서 유통량을 줄여 요청량을 줄일 것인지
    // 민팅 가격 자체를 올려 요청량을 줄일 것인지

    await this.transactionsRepository.save(tx);

    return Ok(rewards);
  }
}
