import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { executionToGqlContext } from 'src/common/functions';
import { User } from 'src/users/entities/user.entity';
import { KEY_PUBKEY, KEY_RTIME, KEY_USER } from '../common/constants';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const gqlContext = executionToGqlContext(context);
    const user = gqlContext[KEY_USER];
    return user;
  },
);

export const Pubkey = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const gqlContext = executionToGqlContext(context);
    const pubkey = gqlContext[KEY_PUBKEY];
    return pubkey;
  },
);

export const RTime = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const gqlContext = executionToGqlContext(context);
    const rtime = gqlContext[KEY_RTIME];
    return rtime;
  },
);
