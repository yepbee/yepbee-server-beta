import { GlobalOptions } from './interfaces';

export const DEFAULT_PORT = 8000;

export const GLOBAL_OPTIONS = new GlobalOptions();

export const KEY_OPTIONS = 'options';

export const KEY_PUBKEY = 'pubkey';

export const KEY_USER = 'user';

export const KEY_ROLES = 'roles';

export enum AuthRole {
  Unknown = 'Unknown', // has no pubkey
  Guest = 'Guest', // not yet signed
  User = 'User', // sigend user
}
