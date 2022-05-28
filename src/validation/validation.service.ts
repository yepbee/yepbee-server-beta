import { Inject, Injectable } from '@nestjs/common';
import { contentTypes, KEY_OPTIONS } from 'src/common/constants';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';
import { User } from 'src/users/entities/user.entity';
import { VerificationService } from 'src/verification/verification.service';
import {
  EnqueueValidatingInput,
  EnqueueValidatingOutput,
} from './dtos/enqueueValidating.dto';
import { geoToH3, h3IndexesAreNeighbors } from 'h3-js';
import { ValidationModuleOptions } from './validation.interface';
import { Web3Service } from 'src/web3/web3.service';
import { MintPhotoInput, MintPhotoOutput } from './dtos/mintPhoto.dto';
import { EnvService } from 'src/env/env.service';
import { createBannerMetadata, PROGRAM_ID } from '@retrip/js';
import { isContentType } from 'src/common/functions';
import { ContentType } from 'src/common/interfaces';

@Injectable()
export class ValidationService {
  readonly TD_MIN: number;
  readonly TD_MAX: number;
  readonly RD_MAX: number;
  readonly MINTING_RESOLUTION: number;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: ValidationModuleOptions,
    private readonly envsService: EnvService,
    private readonly varificationsService: VerificationService,
    private readonly web3Service: Web3Service,
  ) {
    this.TD_MIN = this.options.timeDistanceMinBoundary;
    this.TD_MAX = this.options.timeDistanceMaxBoundary;
    this.RD_MAX = this.options.rewardsOnedayMax;
    this.MINTING_RESOLUTION = +this.envsService.get('H3_MINTING_RESOLUTION');
  }

  // version 1
  @AsyncTryCatch()
  async mintPhoto(
    user: User,
    {
      file,
      description,
      tags,
      location: { latitude, longitude },
    }: MintPhotoInput,
  ): Promise<MintPhotoOutput> {
    const VERSION = 1;

    // check mime-type
    if (isContentType(file.mimetype, { omit: ['application/json'] }) === false)
      return Err(
        `invalid mime-type ${
          file.mimetype
        }. the mime-type should be in the ${Object.keys(contentTypes)}`,
      );

    // double check: valid user
    if (!user.validProperty) return Err(`Forbidden User Request`);

    const chunks = [];

    for await (const chunk of file.createReadStream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const h3 = geoToH3(latitude, longitude, this.MINTING_RESOLUTION);

    // **** WARNING ****
    // location data can be modified as hacking
    // *****************

    const arweaveTags = [
      {
        name: 'Token-Address',
        value: `sol/${user.pubkey}`,
      },
      {
        name: 'Token-Type',
        value: `payload/${PROGRAM_ID}/banner-v1`,
      },
      // {
      //   name: 'Token-Id',
      //   value: 1,
      // },
      {
        name: 'Token-JSON',
        value: JSON.stringify({
          h3Position: h3,
          resolution: this.MINTING_RESOLUTION,
        }),
      },
    ];

    const imageArweaveId = await this.web3Service.uploadToBundlr(
      buffer,
      file.mimetype as ContentType,
      arweaveTags,
    );

    const creatorPubkey = this.web3Service.newPublicKey(user.pubkey);

    const metadata = createBannerMetadata(
      creatorPubkey,
      VERSION,
      1,
      {
        latitude,
        longitude,
        resolution: this.MINTING_RESOLUTION,
      },
      this.web3Service.toArweaveBaseUrl(imageArweaveId), // imageUrl
      description,
      tags.map((v) => ({ trait_type: '', value: v.name })),
    );

    const metadataArweaveId = await this.web3Service.uploadToBundlr(
      JSON.stringify(metadata),
      'application/json',
      arweaveTags,
    );

    const metadataUrl = this.web3Service.toArweaveBaseUrl(metadataArweaveId);

    const creatorNftTokenAccount = this.web3Service.newPublicKey(
      user.validProperty.internalTokenAccounts.nftTokenAccount,
    );

    console.log('minting....');
    await this.web3Service.mintNFT(
      creatorPubkey,
      creatorNftTokenAccount,
      metadataUrl,
      metadata.name,
      'rtb1',
      'banner',
    );
    console.log('succeed');

    return Ok(true);
  }

  @AsyncTryCatch()
  async enqueueValidating(
    user: User,
    { data }: EnqueueValidatingInput,
  ): Promise<EnqueueValidatingOutput> {
    // double check: valid user
    if (!user.validProperty) return Err(`Forbidden User Request`);

    if (data.length > this.RD_MAX)
      return Err(`The daily reward must be less than ${this.RD_MAX}`);

    const rtimes = await this.varificationsService.findRtimes(data);

    console.log(rtimes);

    if (rtimes.length <= 1)
      return Err(`valid data length must be longer than 1`);

    for (let prevRtime = rtimes[0], i = 1; i < rtimes.length; i++) {
      const currRtime = rtimes[i];
      if (!currRtime) continue;

      if (h3IndexesAreNeighbors(prevRtime.h3, currRtime.h3) === false) {
        return Err(`Invalid Naighbor H3 : ${currRtime.h3} (<-${prevRtime.h3})`);
      }

      const timeDistance = currRtime.unixTime - prevRtime.unixTime;

      if (timeDistance > this.TD_MIN || this.TD_MAX > timeDistance) {
        return Err(
          `Invalid Time Distance : ${this.TD_MAX} <= ${timeDistance} <= ${this.TD_MIN}`,
        );
      }
    }

    await this.web3Service.transferSystemToken(
      this.web3Service.newPublicKey(
        user.validProperty.internalTokenAccounts.tokenAccount,
      ),
      data.length - 1,
    );

    // !TODO: push transaction history

    return Ok(true);
  }
}
