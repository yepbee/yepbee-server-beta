import { Inject, Injectable } from '@nestjs/common';
import { contentTypes, KEY_OPTIONS, TokenSymbol } from 'src/common/constants';
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
import { MintBannerInput, MintBannerOutput } from './dtos/mintBanner.dto';
import { EnvService } from 'src/env/env.service';
import {
  ArweaveURL,
  createBannerMetadata,
  getTokenBalance,
  PROGRAM_ID,
  Weather,
} from '@retrip/js';
import { isContentType } from 'src/common/functions';
import { ContentType } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { NftBanner } from './entities/nftBanner.entity';
import { Repository } from 'typeorm';
import { BannerTag } from './entities/bannerTag.entity';
import { MintingResult } from 'src/web3/web3.interface';

@Injectable()
export class ValidationService {
  readonly TD_MIN: number;
  readonly TD_MAX: number;
  readonly RD_MAX: number;
  readonly MINTING_RESOLUTION: number;
  readonly RTRP_PER_HONEYCON: number;
  readonly RTRP_PER_MINTING_BANNER: number;
  readonly TEMPERATURE_MIN: number;
  readonly TEMPERATURE_MAX: number;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: ValidationModuleOptions,
    private readonly envsService: EnvService,
    private readonly varificationsService: VerificationService,
    private readonly web3Service: Web3Service,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(NftBanner)
    private readonly nftBannersRepository: Repository<NftBanner>,
    @InjectRepository(BannerTag)
    private readonly bannerTagsRepository: Repository<BannerTag>,
  ) {
    this.TD_MIN = this.options.timeDistanceMinBoundary;
    this.TD_MAX = this.options.timeDistanceMaxBoundary;
    this.RD_MAX = this.options.rewardsOnedayMax;
    this.MINTING_RESOLUTION = this.options.h3MintingResolution;
    this.RTRP_PER_HONEYCON = this.options.rtrpPerHoneycon;
    this.RTRP_PER_MINTING_BANNER = this.options.rtrpPerMintingBanner;
    this.TEMPERATURE_MIN = -99.0;
    this.TEMPERATURE_MAX = 99.0;
  }

  // version 1
  @AsyncTryCatch()
  async mintBanner(
    user: User,
    {
      file,
      description,
      tags,
      location: { latitude, longitude },
      weather,
      temperatureCel,
    }: MintBannerInput,
  ): Promise<MintBannerOutput> {
    const VERSION = 1;
    const tokenId = 1; // for test (temporary)
    const { mimetype, createReadStream } = await file;
    // check mime-type
    if (isContentType(mimetype, { omit: ['application/json'] }) === false)
      return Err(
        `Invalid mime-type ${mimetype}. the mime-type should be in the ${Object.keys(
          contentTypes,
        ).filter((v: ContentType) => v !== 'application/json')}`,
      );

    if (
      temperatureCel < this.TEMPERATURE_MIN ||
      temperatureCel > this.TEMPERATURE_MAX
    )
      return Err(
        `Invalid temperatrue range ${this.TEMPERATURE_MIN} <= ${temperatureCel} <= ${this.TEMPERATURE_MAX}`,
      );

    const {
      validProperty: { internalTokenAccounts: { tokenAccount } = {} } = {},
      pubkey,
    } = user;

    // double check: valid user
    if (!tokenAccount) return Err(`Forbidden user request`);

    const creatorPubkey = this.web3Service.newPublicKey(pubkey);
    const creatorTokenAccountPubkey =
      this.web3Service.newPublicKey(tokenAccount);

    const creatorBalance = await getTokenBalance(creatorTokenAccountPubkey);

    if (creatorBalance < this.RTRP_PER_MINTING_BANNER)
      return Err(
        `Insufficient token balance : ${creatorBalance} should be more than ${this.RTRP_PER_MINTING_BANNER}`,
      );

    const chunks = [];

    for await (const chunk of createReadStream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const h3 = geoToH3(latitude, longitude, this.MINTING_RESOLUTION);

    // **** WARNING ****
    // location data can be modified as hacking
    // *****************

    await this.web3Service.transferSystemToken(
      this.web3Service.masterTokenAccount,
      this.RTRP_PER_MINTING_BANNER,
      creatorPubkey,
      creatorTokenAccountPubkey,
    ); // extort

    let mintingResult: MintingResult,
      imageUrl: ArweaveURL,
      metadataUrl: ArweaveURL;

    try {
      const arweaveTags = [
        {
          name: 'Token-Address',
          value: `sol/${user.pubkey}`,
        },
        {
          name: 'Token-Type',
          value: `payload/${PROGRAM_ID}/banner-v1`,
        },
        {
          name: 'Token-Id',
          value: `${tokenId}`,
        },
        {
          name: 'Token-JSON',
          value: JSON.stringify({
            h3Position: h3,
            latitude,
            longitude,
            resolution: this.MINTING_RESOLUTION,
            weather: Weather[weather],
            temperatureCel,
          }),
        },
      ];

      const imageArweaveId = await this.web3Service.uploadToBundlr(
        buffer,
        mimetype as ContentType,
        arweaveTags,
      );

      imageUrl = this.web3Service.toArweaveBaseUrl(imageArweaveId);

      const metadata = createBannerMetadata(
        creatorPubkey,
        VERSION,
        1,
        {
          latitude,
          longitude,
          resolution: this.MINTING_RESOLUTION,
        },
        imageUrl,
        description,
        weather,
        temperatureCel,
        tags.map((v) => ({ trait_type: '', value: v.value })),
      );

      arweaveTags[1].value = `metadata/${PROGRAM_ID}/banner-v1`; // change to metadata type

      const metadataArweaveId = await this.web3Service.uploadToBundlr(
        JSON.stringify(metadata),
        'application/json',
        arweaveTags,
      );

      metadataUrl = this.web3Service.toArweaveBaseUrl(metadataArweaveId);

      // const creatorNftTokenAccount = await this.web3Service.findNftTokenAccount(
      //   creatorPubkey,
      // );

      console.log('minting....');
      mintingResult = await this.web3Service.mintNFT(
        creatorPubkey,
        metadataUrl,
        metadata.name,
        'rtb1',
        'banner',
      );
      // console.log('transfering....');
      // await this.web3Service.transferSystemNftToken(creatorNftTokenAccount);
      console.log('succeed');
    } catch (e) {
      await this.web3Service.transferSystemToken(
        creatorTokenAccountPubkey,
        this.RTRP_PER_MINTING_BANNER * 0.5, // 70% back
        this.web3Service.masterPubkey,
        this.web3Service.masterTokenAccount,
      ); // money back

      throw e;
    }

    console.log('saving into our database..');
    const banner = this.nftBannersRepository.create({
      creatorUser: user,
      ownerUser: user,
      mintKey: mintingResult.mintKey.toString(),
      txhash: mintingResult.txhash,
      version: VERSION,
      tokenId, // temporary
      symbol: TokenSymbol.rtb1,
      latitude,
      longitude,
      weather,
      temperatureCel,
      tags,
      description,
      metadataUrl,
      imageUrl,
    });

    await this.nftBannersRepository.save(banner);

    return Ok(true);
  }

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

    const rtimes = await this.varificationsService.findRtimes(data);

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

    try {
      await this.web3Service.transferSystemToken(
        this.web3Service.newPublicKey(tokenAccount),
        this.RTRP_PER_HONEYCON * rewards,
      );
    } catch (e) {
      // records errors
      throw e;
    }

    // !TODO: push transaction history

    return Ok(rewards);
  }
}
