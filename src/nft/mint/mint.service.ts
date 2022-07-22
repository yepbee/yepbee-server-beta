import { Inject, Injectable } from '@nestjs/common';
import {
  AuthUserState,
  contentTypes,
  KEY_OPTIONS,
  TransactionType,
} from 'src/common/constants';
import { AsyncTryCatch } from 'src/common/decorators';
import { Ok } from 'src/common/result/result.function';
import { User } from 'src/users/entities/user.entity';
import { VerificationService } from 'src/verification/verification.service';
import { geoToH3 } from 'h3-js';
import { MintModuleOptions } from './mint.interface';
import { Web3Service } from 'src/web3/web3.service';
import { EnvService } from 'src/env/env.service';
import {
  ArweaveURL,
  createBannerMetadata,
  Metadata,
  parseBannerMetadata,
  ACCOUNT_KEYS,
  Weather,
} from '@retrip/js';
import { isContentType } from 'src/common/functions';
import { ContentType } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { NftBanner } from './entities/nftBanner.entity';
import { Repository } from 'typeorm';
import { BannerTag } from './entities/bannerTag.entity';
import { Transactions } from 'src/users/entities/transactions.entity';
import { AllowUserState } from 'src/auth/allow.decorator';
import { UploadToArweaveInput } from './dtos/uploadToArweave.dto';
import got from 'got';
import { StringOutput } from 'src/common/dtos';

@Injectable()
export class MintService {
  readonly MINTING_RESOLUTION: number;
  readonly RTRP_PER_UPLOADING_ARWEAVE: number;
  readonly RTRP_PER_MINTING_BANNER: number;
  readonly TEMPERATURE_MIN: number;
  readonly TEMPERATURE_MAX: number;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: MintModuleOptions,
    private readonly envsService: EnvService,
    private readonly varificationsService: VerificationService,
    private readonly web3Service: Web3Service,
    // private readonly stateService: StateService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(NftBanner)
    private readonly nftBannersRepository: Repository<NftBanner>,
    @InjectRepository(BannerTag)
    private readonly bannerTagsRepository: Repository<BannerTag>,
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
  ) {
    this.MINTING_RESOLUTION = this.options.h3MintingResolution;
    this.RTRP_PER_UPLOADING_ARWEAVE = this.options.rtrpPerUploadingToArweave;
    this.RTRP_PER_MINTING_BANNER = this.options.rtrpPerMintingBanner;
    this.TEMPERATURE_MIN = -99.0;
    this.TEMPERATURE_MAX = 99.0;
  }

  @AsyncTryCatch()
  async uploadToArweave(
    user: User,
    {
      file,
      description,
      tags,
      location: { latitude, longitude },
      weather,
      temperatureCel,
    }: UploadToArweaveInput,
  ): Promise<StringOutput> {
    const tokenId = 1; // for test (temporary)
    const { mimetype, createReadStream } = await file;
    // check mime-type
    if (isContentType(mimetype, { omit: ['application/json'] }) === false)
      throw new Error(
        `Invalid mime-type ${mimetype}. the mime-type should be in the ${Object.keys(
          contentTypes,
        ).filter((v: ContentType) => v !== 'application/json')}`,
      );

    if (
      temperatureCel < this.TEMPERATURE_MIN ||
      temperatureCel > this.TEMPERATURE_MAX
    )
      throw new Error(
        `Invalid temperatrue range ${this.TEMPERATURE_MIN} <= ${temperatureCel} <= ${this.TEMPERATURE_MAX}`,
      );

    const creatorBalance = await this.web3Service.getBalance(user);

    if (creatorBalance < this.RTRP_PER_MINTING_BANNER)
      throw new Error(
        `Insufficient token balance : ${creatorBalance} should be more than ${this.RTRP_PER_MINTING_BANNER}`,
      );

    const chunks = [];

    for await (const chunk of createReadStream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const h3 = geoToH3(latitude, longitude, this.MINTING_RESOLUTION);

    // **** WARNING ****
    // location data can be modified by hacking
    // *****************

    const arweaveTags = [
      {
        name: 'Token-Address',
        value: `sol/${user.pubkey}`,
      },
      {
        name: 'Token-Type',
        value: `payload/${ACCOUNT_KEYS.PROGRAM_ID}/banner-v1`,
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

    const txhash = await this.web3Service.pay(
      user,
      this.RTRP_PER_UPLOADING_ARWEAVE,
    );
    try {
      await this.web3Service.recordingTransaction(
        user,
        txhash,
        user.pubkey,
        this.web3Service.masterPubkeyString,
        this.RTRP_PER_UPLOADING_ARWEAVE,
        TransactionType.Upload,
      );
    } catch (e) {
      console.error("couldn't record the transaction", e);
    }

    const creatorPubkey = this.web3Service.newPublicKey(user.pubkey);
    let metadataUrl: ArweaveURL;

    // --------------- try ---------------
    try {
      const imageArweaveId = await this.web3Service.uploadToBundlr(
        buffer,
        mimetype as ContentType,
        arweaveTags,
      );
      const imageUrl = this.web3Service.toArweaveBaseUrl(imageArweaveId);

      const metadata = createBannerMetadata(
        creatorPubkey,
        1,
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

      arweaveTags[1].value = `metadata/${ACCOUNT_KEYS.PROGRAM_ID}/banner-v1`; // change to metadata type

      const metadataArweaveId = await this.web3Service.uploadToBundlr(
        JSON.stringify(metadata),
        'application/json',
        arweaveTags,
      );

      metadataUrl = this.web3Service.toArweaveBaseUrl(metadataArweaveId);
      return Ok(metadataUrl);
    } catch (e) {
      // --------------- catch ---------------
      const txhash = await this.web3Service.payback(
        user,
        this.RTRP_PER_UPLOADING_ARWEAVE * 0.5,
      ); // 80% back
      try {
        await this.web3Service.recordingTransaction(
          user,
          txhash,
          this.web3Service.masterPubkeyString,
          user.pubkey,
          this.RTRP_PER_UPLOADING_ARWEAVE * 0.5,
          TransactionType.Upload,
        );
      } catch (e) {
        console.error("couldn't record the transaction", e);
      }

      throw e;
    }
  }

  @AsyncTryCatch()
  async mintBanner(user: User): Promise<StringOutput> {
    const creatorPubkey = this.web3Service.newPublicKey(user.pubkey);
    const metadataUrl = user.stateValue;
    if (!metadataUrl) throw new Error(`invalid stateValue`);
    const data = await got(metadataUrl).json<Metadata>();

    if (typeof data !== 'object' || !data.name)
      throw new Error(`invalid metadataUrl`);

    const mintingResult = await this.web3Service.mintNFT(
      creatorPubkey,
      metadataUrl,
      data.name,
      'rtb1',
      'banner',
    );

    const stateValue = `${metadataUrl} ${mintingResult.mintKey.toString()} ${
      mintingResult.txhash
    }`;

    return Ok(stateValue);
  }

  @AsyncTryCatch()
  async cacheBanner(user: User): Promise<StringOutput> {
    const [metadataUrl, mintKey, txhash] = user.stateValue.split(' ');

    if (await this.nftBannersRepository.findOne({ where: { mintKey } }))
      throw new Error(`the nft is already cached`);

    if (!metadataUrl || !mintKey || !txhash)
      throw new Error(`invalid stateValue`);

    const data = await got(metadataUrl).json<Metadata>();

    if (typeof data !== 'object') throw new Error(`invalid metadataUrl`);

    const parsedMetadata = parseBannerMetadata(data);

    console.log('saving into our database..', parsedMetadata);
    const banner = this.nftBannersRepository.create({
      ...parsedMetadata,
      creatorUser: user,
      ownerUser: user,
      mintKey,
      txhash,
      metadataUrl,
    });

    await this.nftBannersRepository.save(banner);
    //   user.ownedBanners.push(banner);
    //   user.createdBanners.push(banner);

    return Ok('');
  }

  @AsyncTryCatch()
  @AllowUserState(['UploadingToArweave', 'MintingBanner'])
  async cancelMinting(user: User): Promise<StringOutput> {
    let paybackCost = 0;

    switch (user.state) {
      case AuthUserState.UploadingToArweave:
        paybackCost = this.RTRP_PER_UPLOADING_ARWEAVE;
        break;
      case AuthUserState.MintingBanner:
        paybackCost =
          this.RTRP_PER_UPLOADING_ARWEAVE + this.RTRP_PER_MINTING_BANNER;
        break;
    }

    const txhash = await this.web3Service.payback(user, paybackCost * 0.5); // 80% payback
    try {
      await this.web3Service.recordingTransaction(
        user,
        txhash,
        this.web3Service.masterPubkeyString,
        user.pubkey,
        paybackCost * 0.5,
        TransactionType.System,
      );
    } catch (e) {
      console.error("couldn't record the transaction", e);
    }

    return Ok('');
  }
}
