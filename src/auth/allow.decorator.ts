import { SetMetadata } from '@nestjs/common';
import { KEY_ROLES } from 'src/common/constants';
import { AllowedRoles } from './auth.interface';

export const Allow = (roles: AllowedRoles[]) => SetMetadata(KEY_ROLES, roles);
