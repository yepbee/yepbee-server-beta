import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { KEY_PUBKEY, KEY_ROLES, KEY_USER } from 'src/common/constants';
import { User } from 'src/users/entities/user.entity';
import { executionToGqlContext } from '../common/functions';
import { AllowedRoles, AllowedUserState } from './auth.interface';
import { KEY_USER_STATE } from '../common/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = executionToGqlContext(context);

    const roles = this.reflector.get<AllowedRoles[]>(
      KEY_ROLES,
      context.getHandler(),
    );
    if (!roles) return true;

    // UserState
    const userStates = this.reflector.get<AllowedUserState[]>(
      KEY_USER_STATE,
      context.getHandler(),
    );

    for (const role of roles) {
      switch (role) {
        case 'ValidUser':
          if (ctx[KEY_USER] && (ctx[KEY_USER] as User).validProperty) {
            if (userStates) {
              return userStates.includes((ctx[KEY_USER] as User).state);
            }

            return true;
          }
          break;
        case 'User':
          if (ctx[KEY_USER]) {
            if (userStates) {
              return userStates.includes((ctx[KEY_USER] as User).state);
            }

            return true;
          }
          break;
        case 'Guest':
          if (ctx[KEY_PUBKEY]) return true;
          break;
        case 'Unknown':
          return true;
        default:
          return false;
      }
    }
    return false;
  }
}
