import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicKey } from '@retrip/js';
import { KEY_OPTIONS, TransactionType } from 'src/common/constants';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';
import { Transactions } from 'src/users/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { Web3Service } from 'src/web3/web3.service';
import { Repository } from 'typeorm';
import { LikeNftInput, LikeNftOutput } from './dtos/likeNft.dto';
import { StakeToNftInput, StakeToNftOutput } from './dtos/stakeToNft.dto';
import { BannerTag } from './mint/entities/bannerTag.entity';
import { NftBanner } from './mint/entities/nftBanner.entity';
import { NftModuleOptions } from './nft.interface';

@Injectable()
export class NftService {
  readonly RTRP_PER_LIKING_BANNER: number;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: NftModuleOptions,
    private readonly web3Service: Web3Service,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(NftBanner)
    private readonly nftBannersRepository: Repository<NftBanner>,
    @InjectRepository(BannerTag)
    private readonly bannerTagsRepository: Repository<BannerTag>,
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
  ) {
    this.RTRP_PER_LIKING_BANNER = this.options.rtrpPerLikingBanner;
  }

  @AsyncTryCatch()
  async likeNft(user: User, { mintKey }: LikeNftInput): Promise<LikeNftOutput> {
    const nft = await this.nftBannersRepository.findOne({ where: { mintKey } });
    if (!nft) return Err(`Couldn't find that Nft`);

    let txhash = await this.web3Service.pay(user, this.RTRP_PER_LIKING_BANNER);
    try {
      await this.web3Service.recordingTransaction(
        user,
        txhash,
        user.pubkey,
        this.web3Service.masterPubkeyString,
        this.RTRP_PER_LIKING_BANNER,
        TransactionType.Like,
      );
    } catch (e) {
      console.error("couldn't record the transaction", e);
    }

    let mintKeyPublicKey: PublicKey;
    try {
      const [userPublicKey, mintKeyPublicKey] = this.web3Service.newPublicKeys(
        user.pubkey,
        mintKey,
      );
      txhash = await this.web3Service.likeNFT(userPublicKey, mintKeyPublicKey);
    } catch (e) {
      const paybackAmount = this.RTRP_PER_LIKING_BANNER * 0.5;
      const txhash = await this.web3Service.payback(user, paybackAmount);
      try {
        await this.web3Service.recordingTransaction(
          user,
          txhash,
          this.web3Service.masterPubkeyString,
          user.pubkey,
          paybackAmount,
          TransactionType.System,
        );
      } catch (e) {
        console.error("couldn't record the transaction", e);
      }
    }

    const likes = (
      await this.web3Service.fetchNft(mintKeyPublicKey)
    ).likes.toNumber();

    // refresh likes
    nft.likes = likes;
    this.nftBannersRepository.save(nft);

    return Ok(true);
  }

  @AsyncTryCatch()
  async stakeToNft(
    user: User,
    { mintKey, amount }: StakeToNftInput,
  ): Promise<StakeToNftOutput> {
    const nft = await this.nftBannersRepository.findOne({ where: { mintKey } });
    if (!nft) return Err(`Couldn't find that Nft`);

    let txhash = await this.web3Service.pay(user, amount);
    try {
      await this.web3Service.recordingTransaction(
        user,
        txhash,
        user.pubkey,
        mintKey,
        amount,
        TransactionType.Stake,
      );
    } catch (e) {
      console.error("couldn't record the transaction", e);
    }

    let mintKeyPublicKey: PublicKey;
    try {
      const [userPublicKey, mintKeyPublicKey] = this.web3Service.newPublicKeys(
        user.pubkey,
        mintKey,
      );
      txhash = await this.web3Service.stakeToNFT(
        userPublicKey,
        mintKeyPublicKey,
        amount,
      );
    } catch (e) {
      const paybackAmount = +amount * 0.5;
      const txhash = await this.web3Service.payback(user, paybackAmount);
      try {
        await this.web3Service.recordingTransaction(
          user,
          txhash,
          mintKey,
          user.pubkey,
          paybackAmount,
          TransactionType.System,
        );
      } catch (e) {
        console.error("couldn't record the transaction", e);
      }
    }

    const stakes = (await this.web3Service.fetchNft(mintKeyPublicKey)).stakes;

    // refresh stakes
    nft.stakes = stakes.toString();
    this.nftBannersRepository.save(nft);

    return Ok(true);
  }

  @AsyncTryCatch()
  async unstakeToNft(
    user: User,
    { mintKey, amount }: StakeToNftInput,
  ): Promise<StakeToNftOutput> {
    const nft = await this.nftBannersRepository.findOne({ where: { mintKey } });
    if (!nft) return Err(`Couldn't find that Nft`);

    // ***** WARNING ***** need to secure

    const [userPublicKey, mintKeyPublicKey] = this.web3Service.newPublicKeys(
      user.pubkey,
      mintKey,
    );
    let txhash = await this.web3Service.unstakeToNFT(
      userPublicKey,
      mintKeyPublicKey,
      amount,
    );

    txhash = await this.web3Service.payback(user, amount);
    try {
      await this.web3Service.recordingTransaction(
        user,
        txhash,
        mintKey,
        user.pubkey,
        amount,
        TransactionType.Unstake,
      );
    } catch (e) {
      console.error(
        "couldn't record the transaction ",
        e,
        '\ntxhash: ',
        txhash,
      );
    }

    const stakes = (await this.web3Service.fetchNft(mintKeyPublicKey)).stakes;

    // refresh stakes
    nft.stakes = stakes.toString();
    this.nftBannersRepository.save(nft);

    return Ok(true);
  }
}
