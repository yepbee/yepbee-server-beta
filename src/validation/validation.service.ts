import { Inject, Injectable } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
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

@Injectable()
export class ValidationService {
  readonly TD_MIN: number;
  readonly TD_MAX: number;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: ValidationModuleOptions,
    private readonly varificationsService: VerificationService,
    private readonly web3Service: Web3Service,
  ) {
    this.TD_MIN = this.options.timeDistanceMinBoundary;
    this.TD_MAX = this.options.timeDistanceMaxBoundary;
  }
  @AsyncTryCatch()
  async enqueueValidating(
    user: User,
    { data }: EnqueueValidatingInput,
  ): Promise<EnqueueValidatingOutput> {
    if (!user.validProperty) return Err(`Forbidden Request`);
    if (data.length <= 1) return Err(`valid data length must be longer than 1`);

    const rtimes = await this.varificationsService.findRtimes(data);

    for (let prevRtime = rtimes[0], i = 1; i < rtimes.length; i++) {
      const currRtime = rtimes[i];

      if (h3IndexesAreNeighbors(prevRtime.h3, currRtime.h3) === false) {
        return Err(`Invalid Naighbor H3 : ${currRtime.h3} (<-${prevRtime.h3})`);
      }

      const timeDistance = currRtime.unixTime - prevRtime.unixTime;

      if (timeDistance < this.TD_MIN || this.TD_MAX < timeDistance) {
        return Err(
          `Invalid Time Distance : ${this.TD_MIN} <= ${timeDistance} <= ${this.TD_MAX}`,
        );
      }
    }

    await this.web3Service.transferSystemToken(
      this.web3Service.newPublicKey(user.validProperty.internalTokenAccount),
      data.length - 1,
    );

    return Ok(true);
  }
}
