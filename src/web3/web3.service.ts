import { Inject, Injectable } from '@nestjs/common';
import {
  findUserTokenAccount,
  getProgramTokenAccount,
  MINT_ADDRESS,
  PROGRAM_ID,
  PublicKey,
  TOTALSUPPLY_ADDRESS,
  WHITELIST_ADDRESS,
} from '@retrip/js';
import { KEY_OPTIONS, web3 } from 'src/common/constants';
import { AccountAddresses, Web3ModuleOptions } from './web3.interface';
import {
  Program,
  // AnchorError,
  AnchorProvider,
  Wallet,
} from '@project-serum/anchor';
import { RetripJs, IDL } from './idls/retrip_js';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SYSVAR_RENT_PUBKEY } from '@solana/web3.js';

@Injectable()
export class Web3Service {
  private readonly accountAddresses: AccountAddresses = {
    mintPubkey: new PublicKey(MINT_ADDRESS),
    whiteListPubkey: new PublicKey(WHITELIST_ADDRESS),
    totalSupplyPubkey: new PublicKey(TOTALSUPPLY_ADDRESS),
  };
  private readonly programTokenAccount: PublicKey = getProgramTokenAccount()[0];
  private readonly connection: web3.Connection;
  private readonly keypair: web3.Keypair;
  readonly masterPubkey: PublicKey;
  readonly masterTokenAccount: PublicKey;
  readonly program: Program<RetripJs>;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: Web3ModuleOptions,
  ) {
    const apiUrl = this.options.clusterApiUrl;

    this.connection = new web3.Connection(web3.clusterApiUrl(apiUrl));

    this.keypair = web3.Keypair.fromSecretKey(this.options.secretKey);
    this.masterPubkey = this.keypair.publicKey;

    this.masterTokenAccount = findUserTokenAccount(
      this.masterPubkey,
      this.masterPubkey,
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
  ): Promise<PublicKey> {
    if (typeof userPubkey === 'string') userPubkey = new PublicKey(userPubkey);
    const userTokenAccount: PublicKey = findUserTokenAccount(
      userPubkey as PublicKey,
      this.masterPubkey,
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
        programTokenAccount: this.programTokenAccount,
        userTokenAccount,
      })
      .signers([this.keypair])
      .rpc();
    return userTokenAccount;
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
      .transferSystemToken(anchor.BN(amount))
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
}
