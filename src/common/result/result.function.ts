import { Result } from '../interfaces';

export function Ok<O, E>(ok: O): Result<O, E> {
  return { ok };
}

export function Err<O, E>(error: E): Result<O, E> {
  return { error };
}

export function isOk<R extends Result<any, any>>({ ok }: R) {
  return ok !== undefined;
}

export function isErr<R extends Result<any, any>>({ error }: R) {
  return error !== undefined;
}

export function unwrap<O, E>(result: Result<O, E>, _errMsg = ''): O {
  if (isOk(result)) return result.ok;
  throw new Error(`${_errMsg}${result.error}`);
}
