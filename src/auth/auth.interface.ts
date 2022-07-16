import { AuthRole, AuthUserState } from 'src/common/constants';

export type AuthModuleOptions = {
  test: string;
};

export type AllowedRoles = keyof typeof AuthRole;
export type AllowedUserState = keyof typeof AuthUserState;
