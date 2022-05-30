export { nanoid } from 'nanoid';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AnyObject, ContentType, HeaderTokenType } from './interfaces';
import * as FormData from 'form-data';
import { snakeCase } from 'snake-case';
import { contentTypes } from './constants';

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

export function throwException(
  response: string | Record<string, any>,
  status: number,
) {
  throw new HttpException(response, status);
}

export function enumIncludes<T>(_enum: T, _target: any): _target is T[keyof T] {
  return Object.values(_enum).includes(_target as T[keyof T]);
}

export function classNameToString<T extends { constructor: { name: string } }>(
  c: T,
) {
  return c.constructor.name;
}

export function stringToSnakeCase(s: string): string {
  return snakeCase(s);
}

export function objectKeysToObject<T extends Record<string, unknown>>(o: T) {
  const result: Record<keyof T, keyof T> = {} as any;
  console.log(o);
  for (const k in o) {
    result[k] = k;
  }
  return result;
}

export function isContentType(
  s: string,
  option?: {
    omit: ContentType[];
  },
): s is ContentType {
  const { omit = [] } = option || {};
  return (
    Object.keys(contentTypes).includes(s) && !omit.includes(s as ContentType)
  );
}
