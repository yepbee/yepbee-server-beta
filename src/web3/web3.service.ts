import { Inject, Injectable } from '@nestjs/common';
import {
  ARWEAVE_BASE_URL,
  findUserTokenAccount,
  getMasterEditionAddress,
  getMetadataAddress,
  getProgramTokenAccount,
  MINT_ADDRESS,
  NFT_MINT_ADDRESS,
  PROGRAM_ID,
  PublicKey,
  TOKEN_METADATA_PROGRAM_ID,
  TOTALSUPPLY_ADDRESS,
  WHITELIST_ADDRESS,
} from '@retrip/js';
import { KEY_OPTIONS, web3 } from 'src/common/constants';
import {
  AccountAddresses,
  ArweaveURL,
  MintSymbol,
  MintType,
  Suggestion,
  Web3ModuleOptions,
} from './web3.interface';
import {
  Program,
  // AnchorError,
  AnchorProvider,
  Wallet,
} from '@project-serum/anchor';
import { RetripJs, IDL } from './idls/retrip_js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { UserTokenAccounts } from 'src/users/entities/userTokenAccounts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Bundlr from '@bundlr-network/client';
import { ContentType, Result } from 'src/common/interfaces';
import { AsyncTryCatch } from 'src/common/decorators';
import { Err, Ok } from 'src/common/result/result.function';

@Injectable()
export class Web3Service {
  private readonly accountAddresses: AccountAddresses = {
    mintPubkey: new PublicKey(MINT_ADDRESS),
    nftMintPubkey: new PublicKey(NFT_MINT_ADDRESS),
    metadataPubkey: getMetadataAddress(), // <- NFT_MINT_ADDRESS
    masterEditionPubkey: getMasterEditionAddress(), // <- NFT_MINT_ADDRESS
    whiteListPubkey: new PublicKey(WHITELIST_ADDRESS),
    totalSupplyPubkey: new PublicKey(TOTALSUPPLY_ADDRESS),
  };
  private readonly programTokenAccount: PublicKey = getProgramTokenAccount()[0];
  private readonly programNftTokenAccount: PublicKey = getProgramTokenAccount(
    new PublicKey(NFT_MINT_ADDRESS),
  )[0];
  private readonly connection: web3.Connection;
  private readonly keypair: web3.Keypair;
  readonly masterPubkey: PublicKey;
  readonly masterTokenAccount: PublicKey;
  readonly masterNftTokenAccount: PublicKey;
  readonly program: Program<RetripJs>;
  private readonly bundlr: Bundlr;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: Web3ModuleOptions,
    @InjectRepository(UserTokenAccounts)
    private readonly userTokenAccountssRepository: Repository<UserTokenAccounts>,
  ) {
    const apiUrl = this.options.clusterApiUrl;

    this.connection = new web3.Connection(web3.clusterApiUrl(apiUrl));

    this.keypair = web3.Keypair.fromSecretKey(this.options.secretKey);
    this.masterPubkey = this.keypair.publicKey;

    this.masterTokenAccount = findUserTokenAccount(
      this.masterPubkey,
      this.masterPubkey,
    )[0];
    this.masterNftTokenAccount = findUserTokenAccount(
      this.masterPubkey,
      this.masterPubkey,
      this.accountAddresses.nftMintPubkey,
    )[0];

    this.program = new Program<RetripJs>(
      IDL,
      PROGRAM_ID,
      new AnchorProvider(
        this.connection,
        new Wallet(this.keypair),
        AnchorProvider.defaultOptions(),
      ),
    );

    this.bundlr = new Bundlr(
      this.options.bundlr.url,
      this.options.bundlr.providerCurrency,
      this.keypair.secretKey,
      {
        timeout: this.options.bundlr.timeout,
        providerUrl: this.options.bundlr.providerUrl,
      },
    );
  }
  toArweaveBaseUrl(arweaveId: string): ArweaveURL {
    return `${ARWEAVE_BASE_URL}${arweaveId}`;
  }
  newPublicKey(pubkey: string): PublicKey {
    return new PublicKey(pubkey);
  }
  newTransactionInstruction(opts: web3.TransactionInstructionCtorFields) {
    return new web3.TransactionInstruction(opts);
  }
  decodeTransferTransaction(
    instruction: web3.TransactionInstruction,
  ): web3.DecodedTransferInstruction {
    const decodedIx = web3.SystemInstruction.decodeTransfer(instruction);
    return decodedIx;
  }
  getTransaction(
    signature: string,
    options?: { commitment: web3.Finality },
  ): Promise<web3.TransactionResponse> {
    const { commitment = 'finalized' } = options || {};
    return this.connection.getTransaction(signature, {
      commitment,
    });
  }
  getParsedTransaction(
    signature: string,
    options?: { commitment: web3.Finality },
  ): Promise<web3.ParsedTransactionWithMeta> {
    const { commitment = 'finalized' } = options || {};
    return this.connection.getParsedTransaction(signature, commitment);
  }
  async createUserTokenAccount(
    userPubkey: PublicKey | string,
  ): Promise<UserTokenAccounts> {
    if (typeof userPubkey === 'string') userPubkey = new PublicKey(userPubkey);
    const userTokenAccount: PublicKey = findUserTokenAccount(
      userPubkey as PublicKey,
      this.masterPubkey,
    )[0];
    const userNftTokenAccount: PublicKey = findUserTokenAccount(
      userPubkey as PublicKey,
      this.masterPubkey,
      this.accountAddresses.nftMintPubkey,
    )[0];
    await this.program.methods
      .createUser()
      .accounts({
        whiteList: this.accountAddresses.whiteListPubkey,
        payer: this.masterPubkey,
        userPubkey: userPubkey as PublicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        mint: this.accountAddresses.mintPubkey,
        nftMint: this.accountAddresses.nftMintPubkey,
        programTokenAccount: this.programTokenAccount,
        programNftTokenAccount: this.programNftTokenAccount,
        userTokenAccount,
        userNftTokenAccount,
      })
      .signers([this.keypair])
      .rpc();
    return this.userTokenAccountssRepository.create({
      tokenAccount: userTokenAccount.toString(),
      nftTokenAccount: userNftTokenAccount.toString(),
    });
  }

  async uploadToBundlr(
    file: string | Buffer,
    contentType: ContentType,
    tags: { name: string; value: string }[],
  ): Promise<string> {
    console.log('upload to bundlr:');
    tags.push({ name: 'Content-Type', value: contentType });
    const tx = this.bundlr.createTransaction(file, { tags });
    const cost = await this.bundlr.getPrice(tx.size);
    console.log('cost is', cost);
    console.log('funding...');
    const fundStatus = await this.bundlr.fund(cost);
    console.log(fundStatus);
    console.log('signing...');
    await tx.sign();
    console.log('uploading...');
    const { status } = (await tx.upload()) || {};
    if (status === 200) {
      throw new Error(`failed! code: ${status}`);
    }
    console.log('succeed!');
    return tx.id;
  }

  mintNFT(
    creatorPubkey: PublicKey,
    creatorNftTokenAccount: PublicKey, // * unchecked
    metadataUri: string,
    name: string,
    symbol: MintSymbol,
    typeName: MintType,
    royalty = 5,
  ): Promise<string> {
    // creatorKey: creatorPubkey,
    // metadataUri: metadataUrl,
    // name: `banner-v${bannerVersion}-${bannerCount}-${h3Position}:${h3Resolution}`,
    // symbol: 'rtb1',
    // typeName: 'banner',
    // royalty: 5,
    return this.program.methods
      .mintNftAsWhitelist({
        creatorKey: creatorPubkey,
        metadataUri,
        name,
        symbol,
        typeName,
        royalty,
      })
      .accounts({
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        whiteList: this.accountAddresses.whiteListPubkey,
        totalSupply: this.accountAddresses.totalSupplyPubkey,
        payer: this.masterPubkey,
        toPubkey: creatorPubkey,
        toNftTokenAccount: creatorNftTokenAccount,
        nftMint: this.accountAddresses.nftMintPubkey,
        programNftTokenAccount: this.programNftTokenAccount,
        metadata: this.accountAddresses.metadataPubkey,
        masterEdition: this.accountAddresses.masterEditionPubkey,
      })
      .signers([this.keypair])
      .rpc();
  }
  /**
   *
   * @param toTA
   * @param amount 1 = 0.001 rtrp
   * @param fromPubkey
   * @param fromTA
   * @returns
   */
  transferSystemToken(
    toTA: PublicKey,
    amount: number,
    fromPubkey: PublicKey = this.masterPubkey,
    fromTA: PublicKey = this.masterTokenAccount,
  ): Promise<string> {
    return this.program.methods
      .transferSystemToken(new anchor.BN(amount))
      .accounts({
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        mint: this.accountAddresses.mintPubkey,
        whiteList: this.accountAddresses.whiteListPubkey,
        fromPubkey,
        fromTokenAccount: fromTA,
        toTokenAccount: toTA,
        programTokenAccount: getProgramTokenAccount(),
        payer: this.masterPubkey,
      })
      .signers([this.keypair])
      .rpc();
  }
  transferSystemNftToken(
    toNFTTA: PublicKey,
    fromPubkey: PublicKey = this.masterPubkey,
    fromNFTTA: PublicKey = this.masterNftTokenAccount,
  ): Promise<string> {
    return this.program.methods
      .transferSystemNftToken()
      .accounts({
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        nftMint: this.accountAddresses.nftMintPubkey,
        whiteList: this.accountAddresses.whiteListPubkey,
        fromPubkey,
        fromNftTokenAccount: fromNFTTA,
        toNftTokenAccount: toNFTTA,
        programNftTokenAccount: getProgramTokenAccount(
          this.accountAddresses.nftMintPubkey,
        ),
        payer: this.masterPubkey,
      })
      .signers([this.keypair])
      .rpc();
  }
  suggestAsWhitelist(suggestion: Suggestion): Promise<string> {
    return this.program.methods
      .suggestAsWhitelist(suggestion)
      .accounts({
        whiteList: this.accountAddresses.whiteListPubkey,
      })
      .rpc();
  }
}
