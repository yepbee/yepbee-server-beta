import { GlobalOptions } from './interfaces';

export * as web3 from '@solana/web3.js';
import * as bs58 from 'bs58';
import { registerEnumType } from '@nestjs/graphql';
import { Weather } from '@retrip/js';
export { bs58 };

export const SERVICE_DESCRIPTION_LENGTH = 2200;

export const SERVICE_TAG_LENGTH = 22;

export const SERVICE_TAGS_MAX_SIZE = 10;

export const H3_WALKING_RESOLUTION = 12; // +process.env['H3_WALKING_RESOLUTION'];

export const DEFAULT_PORT = 8000;

export const GLOBAL_OPTIONS = new GlobalOptions();

export const KEY_DATABASE_URL = 'DATABASE_URL';

export const KEY_OPTIONS = 'options';

export const KEY_PUBKEY = 'pubkey';

export const KEY_RTIME = 'rtime';

export const KEY_USER = 'user';

export const KEY_ROLES = 'roles';

export const contentTypes = {
  'application/json': '',
  'image/jpeg': '',
  'image/png': '',
};

export enum AuthRole {
  Unknown = 'Unknown', // has no pubkey
  Guest = 'Guest', // not yet signed
  User = 'User', // sigend user
  ValidUser = 'ValidUser', // premium user
}

export enum RtimeId {
  AuthToken = 'AuthToken',
  Walking = 'Walking',
}

export enum TokenSymbol {
  rtb1,
}

export enum CurrencyType {
  Sol,
  RTRP,
}

export enum TransactionType {
  Reward,
  Mint,
  Withdraw,
  System,
  Unknown,
}

registerEnumType(RtimeId, { name: 'RtimeId' });
registerEnumType(Weather, { name: 'Weather' });
registerEnumType(TokenSymbol, { name: 'TokenSymbol' });
registerEnumType(CurrencyType, { name: 'CurrencyType' });
registerEnumType(TransactionType, { name: 'TransactionType' });
