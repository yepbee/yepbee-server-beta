import { SetMetadata } from '@nestjs/common';
import { KEY_ROLES, KEY_USER_STATE } from 'src/common/constants';
import { AllowedRoles, AllowedUserState } from './auth.interface';

export const Allow = (roles: AllowedRoles[]) => SetMetadata(KEY_ROLES, roles);

export const AllowUserState = (state: AllowedUserState[]) =>
  SetMetadata(KEY_USER_STATE, state);
