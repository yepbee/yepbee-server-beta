import { Inject, Injectable } from '@nestjs/common';
import {
  AuthUserState,
  contentTypes,
  CurrencyType,
  KEY_OPTIONS,
  TransactionType,
} from 'src/common/constants';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';
import { User } from 'src/users/entities/user.entity';
import { VerificationService } from 'src/verification/verification.service';
import { geoToH3 } from 'h3-js';
import { MintModuleOptions } from './mint.interface';
import { Web3Service } from 'src/web3/web3.service';
import { EnvService } from 'src/env/env.service';
import {
  ArweaveURL,
  createBannerMetadata,
  getTokenBalance,
  Metadata,
  parseBannerMetadata,
  PROGRAM_ID,
  Weather,
} from '@retrip/js';
import { isContentType } from 'src/common/functions';
import { ContentType } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { NftBanner } from './entities/nftBanner.entity';
import { Repository } from 'typeorm';
import { BannerTag } from './entities/bannerTag.entity';
import { Transactions } from 'src/users/entities/transactions.entity';
import { StateService } from '../state/state.service';
import { AllowUserState } from 'src/auth/allow.decorator';
import { NewStateOutput } from './dtos/common.dto';
import { CoreOutput } from 'src/common/dtos';
import { UploadToArweaveInput } from './dtos/uploadToArweave.dto';
import got from 'got';

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
    private readonly stateService: StateService,
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
  private async getBalance(user: User): Promise<CoreOutput<number>> {
    const {
      validProperty: { internalTokenAccounts: { tokenAccount } = {} } = {},
    } = user;

    // double check: valid user
    if (!tokenAccount) return Err(`Forbidden user request`);
    const creatorTokenAccountPubkey =
      this.web3Service.newPublicKey(tokenAccount);

    return Ok(await getTokenBalance(creatorTokenAccountPubkey));
  }

  private pay(user: User, amount: number): Promise<string> {
    const {
      validProperty: { internalTokenAccounts: { tokenAccount } = {} } = {},
      pubkey,
    } = user;

    // double check: valid user
    if (!tokenAccount) throw new Error(`Forbidden user request`);

    const creatorPubkey = this.web3Service.newPublicKey(pubkey);
    const creatorTokenAccountPubkey =
      this.web3Service.newPublicKey(tokenAccount);

    return this.web3Service.transferSystemToken(
      this.web3Service.masterTokenAccount,
      amount,
      creatorPubkey,
      creatorTokenAccountPubkey,
    );
  }

  private payback(user: User, amount: number): Promise<string> {
    const {
      validProperty: { internalTokenAccounts: { tokenAccount } = {} } = {},
    } = user;

    // double check: valid user
    if (!tokenAccount) throw new Error(`Forbidden user request`);

    const creatorTokenAccountPubkey =
      this.web3Service.newPublicKey(tokenAccount);

    return this.web3Service.transferSystemToken(
      creatorTokenAccountPubkey,
      amount,
      this.web3Service.masterPubkey,
      this.web3Service.masterTokenAccount,
    );
  }

  private async recordingTransaction(
    user: User,
    txhash: string,
    from: string,
    to: string,
    amount: number,
    type: TransactionType,
  ) {
    console.log('recording the transaction...');
    const tx = this.transactionsRepository.create({
      owner: user,
      currency: CurrencyType.RTRP,
      txhash,
      from,
      to,
      amount,
      type,
    });

    await this.transactionsRepository.save(tx);
  }

  // -------------------------

  @AsyncTryCatch()
  @AllowUserState(['None'])
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
  ): Promise<NewStateOutput> {
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

    const creatorBalance = await this.getBalance(user);

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
    // location data can be modified by hacking
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

    const txhash = await this.pay(user, this.RTRP_PER_UPLOADING_ARWEAVE);
    try {
      await this.recordingTransaction(
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

      arweaveTags[1].value = `metadata/${PROGRAM_ID}/banner-v1`; // change to metadata type

      const metadataArweaveId = await this.web3Service.uploadToBundlr(
        JSON.stringify(metadata),
        'application/json',
        arweaveTags,
      );

      metadataUrl = this.web3Service.toArweaveBaseUrl(metadataArweaveId);
    } catch (e) {
      // --------------- catch ---------------
      const txhash = await this.payback(
        user,
        this.RTRP_PER_UPLOADING_ARWEAVE * 0.8,
      ); // 80% back
      try {
        await this.recordingTransaction(
          user,
          txhash,
          this.web3Service.masterPubkeyString,
          user.pubkey,
          this.RTRP_PER_UPLOADING_ARWEAVE * 0.8,
          TransactionType.Upload,
        );
      } catch (e) {
        console.error("couldn't record the transaction", e);
      }

      throw e;
    }

    const newState = AuthUserState.UploadingToArweave;
    const stateValue = metadataUrl;

    await this.stateService.next(user.state, newState, user, stateValue);

    return Ok({
      newState,
      stateValue,
    });
  }

  @AsyncTryCatch()
  @AllowUserState(['UploadingToArweave'])
  async mintBanner(user: User): Promise<NewStateOutput> {
    const creatorPubkey = this.web3Service.newPublicKey(user.pubkey);
    const metadataUrl = user.stateValue;
    if (!metadataUrl) return Err(`invalid stateValue`);
    const data = await got(metadataUrl).json<Metadata>();
    console.log('get metadata : ', data);
    if (typeof data !== 'object' || !data.name)
      return Err(`invalid metadataUrl`);

    const txhash = await this.pay(user, this.RTRP_PER_MINTING_BANNER);
    try {
      await this.recordingTransaction(
        user,
        txhash,
        user.pubkey,
        this.web3Service.masterPubkeyString,
        this.RTRP_PER_MINTING_BANNER,
        TransactionType.Mint,
      );
    } catch (e) {
      console.error("couldn't record the transaction", e);
    }

    try {
      const mintingResult = await this.web3Service.mintNFT(
        creatorPubkey,
        metadataUrl,
        data.name,
        'rtb1',
        'banner',
      );

      const newState = AuthUserState.MintingBanner;
      const stateValue = `${metadataUrl} ${mintingResult.mintKey.toString()} ${
        mintingResult.txhash
      }`;

      await this.stateService.next(user.state, newState, user, stateValue);

      return Ok({
        newState,
        stateValue,
      });
    } catch (e) {
      const txhash = await this.payback(
        user,
        this.RTRP_PER_MINTING_BANNER * 0.8,
      );
      try {
        await this.recordingTransaction(
          user,
          txhash,
          this.web3Service.masterPubkeyString,
          user.pubkey,
          this.RTRP_PER_MINTING_BANNER * 0.8,
          TransactionType.Mint,
        );
      } catch (e) {
        console.error("couldn't record the transaction", e);
      }

      throw e;
    }
  }

  @AsyncTryCatch()
  @AllowUserState(['MintingBanner'])
  async cacheBanner(user: User): Promise<NewStateOutput> {
    const [metadataUrl, mintKey, txhash] = user.stateValue.split(' ');
    if (!metadataUrl || !mintKey || !txhash) return Err(`invalid stateValue`);
    const data = await got(metadataUrl).json<Metadata>();
    console.log('get metadata : ', data);
    if (typeof data !== 'object') return Err(`invalid metadataUrl`);

    const parsedMetadata = parseBannerMetadata(data);

    console.log('saving into our database..');
    const banner = this.nftBannersRepository.create({
      creatorUser: user,
      ownerUser: user,
      mintKey,
      txhash,
      metadataUrl,
      ...parsedMetadata,
    });

    await this.nftBannersRepository.save(banner);

    const newState = AuthUserState.None;
    const stateValue = '';
    await this.stateService.next(user.state, newState, user, stateValue); // to initial

    return Ok({ newState, stateValue });
  }

  @AsyncTryCatch()
  @AllowUserState(['UploadingToArweave', 'MintingBanner'])
  async cancelMinting(user: User): Promise<NewStateOutput> {
    let paybackCost: number;

    switch (user.state) {
      case AuthUserState.UploadingToArweave:
        paybackCost = this.RTRP_PER_UPLOADING_ARWEAVE;
        break;
      case AuthUserState.MintingBanner:
        paybackCost =
          this.RTRP_PER_UPLOADING_ARWEAVE + this.RTRP_PER_MINTING_BANNER;
        break;
    }

    const txhash = await this.payback(user, paybackCost * 0.8); // 80% payback
    try {
      await this.recordingTransaction(
        user,
        txhash,
        this.web3Service.masterPubkeyString,
        user.pubkey,
        paybackCost * 0.8,
        TransactionType.System,
      );
    } catch (e) {
      console.error("couldn't record the transaction", e);
    }

    const newState = AuthUserState.None;
    const stateValue = '';
    await this.stateService.next(user.state, newState, user, stateValue); // to initial

    return Ok({ newState, stateValue });
  }
  // // version 1
  // @AsyncTryCatch()
  // async mintBanner(
  //   user: User,
  //   {
  //     file,
  //     description,
  //     tags,
  //     location: { latitude, longitude },
  //     weather,
  //     temperatureCel,
  //   }: MintBannerInput,
  // ): Promise<MintBannerOutput> {
  //   const VERSION = 1;
  //   const tokenId = 1; // for test (temporary)
  //   const { mimetype, createReadStream } = await file;
  //   // check mime-type
  //   if (isContentType(mimetype, { omit: ['application/json'] }) === false)
  //     return Err(
  //       `Invalid mime-type ${mimetype}. the mime-type should be in the ${Object.keys(
  //         contentTypes,
  //       ).filter((v: ContentType) => v !== 'application/json')}`,
  //     );

  //   if (
  //     temperatureCel < this.TEMPERATURE_MIN ||
  //     temperatureCel > this.TEMPERATURE_MAX
  //   )
  //     return Err(
  //       `Invalid temperatrue range ${this.TEMPERATURE_MIN} <= ${temperatureCel} <= ${this.TEMPERATURE_MAX}`,
  //     );

  //   const {
  //     validProperty: { internalTokenAccounts: { tokenAccount } = {} } = {},
  //     pubkey,
  //   } = user;

  //   // double check: valid user
  //   if (!tokenAccount) return Err(`Forbidden user request`);

  //   const creatorPubkey = this.web3Service.newPublicKey(pubkey);
  //   const creatorTokenAccountPubkey =
  //     this.web3Service.newPublicKey(tokenAccount);

  //   const creatorBalance = await getTokenBalance(creatorTokenAccountPubkey);

  //   if (creatorBalance < this.RTRP_PER_MINTING_BANNER)
  //     return Err(
  //       `Insufficient token balance : ${creatorBalance} should be more than ${this.RTRP_PER_MINTING_BANNER}`,
  //     );

  //   const chunks = [];

  //   for await (const chunk of createReadStream()) {
  //     chunks.push(chunk);
  //   }

  //   const buffer = Buffer.concat(chunks);

  //   const h3 = geoToH3(latitude, longitude, this.MINTING_RESOLUTION);

  //   // **** WARNING ****
  //   // location data can be modified by hacking
  //   // *****************

  //   const txhash = await this.web3Service.transferSystemToken(
  //     this.web3Service.masterTokenAccount,
  //     this.RTRP_PER_MINTING_BANNER,
  //     creatorPubkey,
  //     creatorTokenAccountPubkey,
  //   ); // extort

  //   let mintingResult: MintingResult,
  //     imageUrl: ArweaveURL,
  //     metadataUrl: ArweaveURL;

  //   try {
  //     const arweaveTags = [
  //       {
  //         name: 'Token-Address',
  //         value: `sol/${user.pubkey}`,
  //       },
  //       {
  //         name: 'Token-Type',
  //         value: `payload/${PROGRAM_ID}/banner-v1`,
  //       },
  //       {
  //         name: 'Token-Id',
  //         value: `${tokenId}`,
  //       },
  //       {
  //         name: 'Token-JSON',
  //         value: JSON.stringify({
  //           h3Position: h3,
  //           latitude,
  //           longitude,
  //           resolution: this.MINTING_RESOLUTION,
  //           weather: Weather[weather],
  //           temperatureCel,
  //         }),
  //       },
  //     ];

  //     const imageArweaveId = await this.web3Service.uploadToBundlr(
  //       buffer,
  //       mimetype as ContentType,
  //       arweaveTags,
  //     );

  //     imageUrl = this.web3Service.toArweaveBaseUrl(imageArweaveId);

  //     const metadata = createBannerMetadata(
  //       creatorPubkey,
  //       VERSION,
  //       1,
  //       {
  //         latitude,
  //         longitude,
  //         resolution: this.MINTING_RESOLUTION,
  //       },
  //       imageUrl,
  //       description,
  //       weather,
  //       temperatureCel,
  //       tags.map((v) => ({ trait_type: '', value: v.value })),
  //     );

  //     arweaveTags[1].value = `metadata/${PROGRAM_ID}/banner-v1`; // change to metadata type

  //     const metadataArweaveId = await this.web3Service.uploadToBundlr(
  //       JSON.stringify(metadata),
  //       'application/json',
  //       arweaveTags,
  //     );

  //     metadataUrl = this.web3Service.toArweaveBaseUrl(metadataArweaveId);

  //     // const creatorNftTokenAccount = await this.web3Service.findNftTokenAccount(
  //     //   creatorPubkey,
  //     // );

  //     console.log('minting....');
  //     mintingResult = await this.web3Service.mintNFT(
  //       creatorPubkey,
  //       metadataUrl,
  //       metadata.name,
  //       'rtb1',
  //       'banner',
  //     );
  //     // console.log('transfering....');
  //     // await this.web3Service.transferSystemNftToken(creatorNftTokenAccount);
  //     console.log('succeed');
  //   } catch (e) {
  //     await this.web3Service.transferSystemToken(
  //       creatorTokenAccountPubkey,
  //       this.RTRP_PER_MINTING_BANNER * 0.5, // 70% back
  //       this.web3Service.masterPubkey,
  //       this.web3Service.masterTokenAccount,
  //     ); // money back

  //     throw e;
  //   }

  //   console.log('recording the transaction...');
  //   const tx = this.transactionsRepository.create({
  //     owner: user,
  //     currency: CurrencyType.RTRP,
  //     txhash,
  //     from: pubkey,
  //     to: this.web3Service.masterPubkey.toString(),
  //     amount: this.RTRP_PER_MINTING_BANNER,
  //     type: TransactionType.Mint,
  //   });

  //   await this.transactionsRepository.save(tx);

  //   console.log('saving into our database..');
  //   const banner = this.nftBannersRepository.create({
  //     creatorUser: user,
  //     ownerUser: user,
  //     mintKey: mintingResult.mintKey.toString(),
  //     txhash: mintingResult.txhash,
  //     version: VERSION,
  //     tokenId, // temporary
  //     symbol: TokenSymbol.rtb1,
  //     latitude,
  //     longitude,
  //     weather,
  //     temperatureCel,
  //     tags,
  //     description,
  //     metadataUrl,
  //     imageUrl,
  //   });

  //   await this.nftBannersRepository.save(banner);

  //   return Ok(true);
  // }
}
