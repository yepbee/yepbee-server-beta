export { nanoid } from 'nanoid';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AnyObject, HeaderTokenType } from './interfaces';
import * as FormData from 'form-data';

/**
 *
 * @returns Current unix-time as seconds
 */
export function getUnixTime(): number {
  return (Date.now() / 1000) | 0;
}

export function splitOnce(s: string, ch: string): string[] {
  const index = s.indexOf(ch);
  return [s.slice(0, index), s.slice(index + 1)];
}

export function executionToGqlContext(context: ExecutionContext) {
  return GqlExecutionContext.create(context).getContext();
}

export function Authorization<T extends HeaderTokenType, B extends string>(
  tokenType: T,
  tokenBody: B,
): { Authorization: `${typeof tokenType} ${typeof tokenBody}` } {
  return {
    Authorization: `${tokenType} ${tokenBody}`,
  };
}

export function toBase64(s: string): string {
  return Buffer.from(s).toString('base64');
}

export function makeForm(o: AnyObject) {
  const form = new FormData();
  for (const k in o) {
    form.append(k, o[k]);
  }
  return form;
}
