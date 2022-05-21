export { nanoid } from 'nanoid';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

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
