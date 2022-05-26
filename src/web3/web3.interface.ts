import { PublicKey } from '@retrip/js';
import { Cluster } from 'src/common/interfaces';

export type Web3ModuleOptions = {
  clusterApiUrl: Cluster;
  secretKey: Uint8Array;
};

export type AccountAddresses = {
  mintPubkey: PublicKey;
  whiteListPubkey: PublicKey;
  totalSupplyPubkey: PublicKey;
};
