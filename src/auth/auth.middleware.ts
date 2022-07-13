import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { KEY_PUBKEY, KEY_RTIME, KEY_USER } from 'src/common/constants';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';

type Req = Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
type Res = Response<any, Record<string, any>>;
type Next = (error?: any) => void;

@Injectable()
export class AuthMiddleware implements NestMiddleware<Request, Response> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}
  async use(req: Req, res: Res, next: Next) {
    const { headers: { authorization } = {} } = req;
    if (!authorization) return next();

    const token = this.tokenService.verifyAndSplit(authorization);
    if (!token) return next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pubkey, _, rtime] = token[1].split('.'); // parsing token body
    req[KEY_PUBKEY] = pubkey;
    req[KEY_RTIME] = rtime;
    if (pubkey) {
      req[KEY_USER] = await this.authService.findUserByPubkey(pubkey);
      // console.log('user', req[KEY_USER]);
    }
    // console.log('next');
    next();
  }
}
