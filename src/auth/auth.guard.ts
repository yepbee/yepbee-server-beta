import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { KEY_PUBKEY, KEY_ROLES, KEY_USER } from 'src/common/constants';
import { executionToGqlContext } from '../common/functions';
import { AllowedRoles } from './allow.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = executionToGqlContext(context);

    const roles = this.reflector.get<AllowedRoles>(
      KEY_ROLES,
      context.getHandler(),
    );
    if (!roles) return true;

    for (const role of roles) {
      switch (role) {
        case 'User':
          return ctx[KEY_USER] ? true : false;
        case 'Guest':
          return ctx[KEY_PUBKEY] ? true : false;
        case 'Unknown':
          return true;
        default:
      }
    }
    return false;
  }
}
