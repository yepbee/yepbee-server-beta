export { nanoid } from 'nanoid';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AnyObject, ContentType, HeaderTokenType, Result } from './interfaces';
import * as FormData from 'form-data';
import { snakeCase } from 'snake-case';
import { AuthUserState, contentTypes, TransactionType } from './constants';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Web3Service } from 'src/web3/web3.service';
import { Err } from './result/result.function';
import { StringOutput } from './dtos';

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

export function wait(user: User, usersRepository: Repository<User>) {
  user.isWaiting = true;
  return usersRepository.save(user, { reload: true });
}
export function go(user: User, usersRepository: Repository<User>) {
  user.isWaiting = false;
  return usersRepository.save(user, { reload: true });
}
export function changeState(
  user: User,
  usersRepository: Repository<User>,
  state: AuthUserState,
  stateValue?: string,
) {
  user.state = state;
  if (stateValue != null) user.stateValue = stateValue;
  return usersRepository.save(user, { reload: true });
}
export async function doOnce<O, E>(
  user: User,
  usersRepository: Repository<User>,
  func: () => Promise<Result<O, E>>,
) {
  if (user.isWaiting) return Err('wait for executing...');
  await wait(user, usersRepository);
  const result = await func();
  if (result.error) {
    await go(user, usersRepository);
  }
  return result;
}

export async function connectStates(
  user: User,
  usersRepository: Repository<User>,
  func: () => Promise<StringOutput>,
  {
    from,
    to,
  }: { from?: keyof typeof AuthUserState; to: keyof typeof AuthUserState },
) {
  const prevState = user.state,
    prevStateValue = user.stateValue;

  if (from) {
    user.state = AuthUserState[from];
    await changeState(user, usersRepository, AuthUserState[from]);
  }

  const result = await func();

  if (result.ok) {
    await changeState(user, usersRepository, AuthUserState[to], result.ok);
  }
  if (result.error) {
    await changeState(user, usersRepository, prevState, prevStateValue);
  }

  return result;
}

export async function doPayable<O, E>(
  user: User,
  web3Service: Web3Service,
  func: () => Promise<Result<O, E>>,
  {
    payAmount,
    payType,
    paybackType,
    refundRate,
  }: {
    payAmount: number;
    payType: TransactionType;
    paybackType?: TransactionType;
    refundRate?: number;
  },
) {
  if (!paybackType) paybackType = payType;
  if (!refundRate) refundRate = 0.5;

  let txhash = await web3Service.pay(user, payAmount);
  try {
    await web3Service.recordingTransaction(
      user,
      txhash,
      user.pubkey,
      web3Service.masterPubkeyString,
      payAmount,
      payType,
    );
  } catch (e) {
    console.error("couldn't record the transaction", e);
  }
  const result = await func();
  if (result.error) {
    txhash = await web3Service.payback(user, payAmount * refundRate);
    try {
      await web3Service.recordingTransaction(
        user,
        txhash,
        web3Service.masterPubkeyString,
        user.pubkey,
        payAmount * refundRate,
        paybackType,
      );
    } catch (e) {
      console.error("couldn't record the transaction", e);
    }
  }
  return result;
}
