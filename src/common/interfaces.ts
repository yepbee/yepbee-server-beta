import { CancelableRequest, Response } from 'got';
import internal from 'stream';

export interface Result<Ok, Err> {
  ok?: Ok;
  error?: Err;
}

export interface CoreResult {
  ok?: boolean;
  error?: string;
}

export type AnyObject = Record<string, unknown>;

export type PromiseGotRequest = CancelableRequest<Response<string>>;

export type RequestBody = string | Buffer | internal.Readable;

export type HeaderTokenType = 'Basic' | 'Bearer' | 'utec';
