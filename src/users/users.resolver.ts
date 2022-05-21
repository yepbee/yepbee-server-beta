import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { SignupInput, SignupOutput } from './dtos/signup.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Allow } from '../auth/allow.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Allow(['User'])
  @Query(() => User)
  me(@AuthUser() user: User): User {
    return user;
  }

  @Allow(['Guest'])
  @Mutation(() => SignupOutput)
  signup(@Args() signupInput: SignupInput): Promise<SignupOutput> {
    return this.usersService.signup(signupInput);
  }
}
