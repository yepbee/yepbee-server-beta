import { SetMetadata } from '@nestjs/common';
import { AuthRole, KEY_ROLES } from 'src/common/constants';

export type AllowedRoles = keyof typeof AuthRole;

export const Allow = (roles: AllowedRoles[]) => SetMetadata(KEY_ROLES, roles);
