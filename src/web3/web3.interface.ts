import { PublicKey } from '@retrip/js';
import { Cluster } from 'src/common/interfaces';
import * as anchor from '@project-serum/anchor';

export type Web3ModuleOptions = {
  secretKey: Uint8Array;
  clusterApiUrl: Cluster;
  bundlr: {
    url: string;
    providerUrl: string;
    providerCurrency: string;
    timeout: number;
  };
};

export type AccountAddresses = {
  mintPubkey: PublicKey;
  nftMintPubkey: PublicKey;
  metadataPubkey: PublicKey;
  masterEditionPubkey: PublicKey;
  whiteListPubkey: PublicKey;
  totalSupplyPubkey: PublicKey;
};

export type Option<T> = T | null;
export type TransactionAccount = Record<string, never>;
export type Transaction = {
  // Target program to execute against.
  program_id: PublicKey;
  // Accounts requried for the transaction.
  accounts: TransactionAccount[];
  // Instruction data for the transaction.
  data: number[];
};

export type Lister = {
  pubkey: PublicKey;
  suggestion: Suggestion;
};

export type President = { pubkey: PublicKey; expirationDate: anchor.BN };

export type Suggestion =
  | {
      votePresident: {
        vote: Option<President>;
      };
    }
  | {
      execTransactions: {
        txs: Transaction[];
      };
    }
  | {
      addWhiteList: {
        pubkeys: PublicKey[];
      };
    }
  | {
      delWhiteList: {
        pubkeys: PublicKey[];
      };
    }
  | {
      none: Record<string, never>;
    };

export type ArweaveURL = `https://arweave.net/${string}`;

export type MintSymbol = 'rtb1';
export type MintType = 'banner';
