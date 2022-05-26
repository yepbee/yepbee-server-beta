import { HttpStatus } from '@nestjs/common';
import { web3 } from '@retrip/js';
import { CancelableRequest, Response } from 'got';
import internal from 'stream';
import { throwException } from './functions';
export * as web3 from '@solana/web3.js';

export interface Result<Ok, Err> {
  ok?: Ok;
  error?: Err;
}

export interface CoreResult {
  ok?: boolean;
  error?: string;
}

export type Enum<E> = Record<keyof E, number | string> & {
  [k: number]: keyof E;
};

export type AnyObject = Record<string, unknown>;

export type PromiseGotRequest = CancelableRequest<Response<string>>;

export type RequestBody = string | Buffer | internal.Readable;

export type HeaderTokenType = 'Basic' | 'Bearer' | 'utec';

export type GlobalOption = {
  port: number;
  baseUrl: string;
  isInitialized: boolean;
};

export class GlobalOptions {
  private readonly _: GlobalOption = {
    port: 8000,
    baseUrl: `localhost:8000`,
    isInitialized: false,
  };
  private readonly throwNotInitException = () =>
    throwException('Not Initialized', HttpStatus.INTERNAL_SERVER_ERROR);

  getAll(): GlobalOption {
    return this._;
  }

  get(keys: (keyof GlobalOption)[]): GlobalOption {
    if (!this._.isInitialized) this.throwNotInitException();
    const result = {};
    for (const key of keys) {
      result[key] = this._[key];
    }
    return result as GlobalOption;
  }
  getOne(key: keyof GlobalOption) {
    if (!this._.isInitialized) this.throwNotInitException();
    return this._[key];
  }
  set(obj: Partial<GlobalOption>): GlobalOptions {
    for (const key in obj) {
      this._[key] = obj[key];
    }
    return this;
  }
  setOne<K extends keyof GlobalOption>(
    key: K,
    value: GlobalOption[K],
  ): GlobalOptions {
    this._[key] = value;
    return this;
  }
}

export type Cluster = web3.Cluster;
