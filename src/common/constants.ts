import { GlobalOptions } from './interfaces';

export * as web3 from '@solana/web3.js';
import * as bs58 from 'bs58';
export { bs58 };

export const H3_WALKING_RESOLUTION = 12; // +process.env['H3_WALKING_RESOLUTION'];

export const DEFAULT_PORT = 8000;

export const GLOBAL_OPTIONS = new GlobalOptions();

export const KEY_OPTIONS = 'options';

export const KEY_PUBKEY = 'pubkey';

export const KEY_RTIME = 'rtime';

export const KEY_USER = 'user';

export const KEY_ROLES = 'roles';

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
