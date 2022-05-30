import { AuthRole } from 'src/common/constants';

export type AuthModuleOptions = {
  test: string;
};

export type AllowedRoles = keyof typeof AuthRole;
