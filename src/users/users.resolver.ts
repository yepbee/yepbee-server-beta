import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { SignupInput, SignupOutput } from './dtos/signup.dto';
import { AuthUser, Pubkey, RTime } from 'src/auth/auth-user.decorator';
import { Allow } from '../auth/allow.decorator';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import {
  SignupChainUserInput,
  SignupChainUserOutput,
} from './dtos/signupChainUser.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // for the test
  @Query(() => User)
  @Allow(['User', 'ValidUser'])
  me(@AuthUser() user: User): User {
    return user;
  }

  @Mutation(() => SignupOutput)
  @Allow(['Guest'])
  signup(
    @Args() signupInput: SignupInput,
    @Pubkey() pubkey: string,
    @RTime() rtime: string,
  ): Promise<SignupOutput> {
    return this.usersService.signup(signupInput, pubkey, rtime);
  }

  @Mutation(() => EditProfileOutput)
  @Allow(['User', 'ValidUser'])
  editProfile(
    @Args() editProfileInput: EditProfileInput,
    @AuthUser() user: User,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(editProfileInput, user);
  }

  @Mutation(() => SignupChainUserOutput)
  @Allow(['User'])
  signupChainUser(
    @Args() signupChainUserInput: SignupChainUserInput,
    @AuthUser() user: User,
  ): Promise<SignupChainUserOutput> {
    return this.usersService.signupChainUser(signupChainUserInput, user);
  }
}
