import { Injectable, NestMiddleware } from '@nestjs/common';
import { verifyAuthToken } from '@retrip/js';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { KEY_PUBKEY, KEY_USER } from 'src/common/constants';
import { splitOnce } from 'src/common/functions';
import { RtimeService } from 'src/rtime/rtime.service';
import { AuthService } from './auth.service';

type Req = Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
type Res = Response<any, Record<string, any>>;
type Next = (error?: any) => void;

@Injectable()
export class AuthMiddleware implements NestMiddleware<Request, Response> {
  constructor(
    private readonly rtimeService: RtimeService,
    private readonly authService: AuthService,
  ) {}
  async use(req: Req, res: Res, next: Next) {
    const { headers: { authorization } = {} } = req;

    if (typeof authorization === 'string') {
      const [tokenType, tokenBody] = authorization.split(' ');

      if (this.verifyToken(tokenType, tokenBody)) {
        const [pubkey] = splitOnce(tokenBody, '.');
        console.log(pubkey);
        req[KEY_PUBKEY] = pubkey;
        if (pubkey) {
          req[KEY_USER] = await this.authService.findUserByPubkey(pubkey);
        }
      }
    }

    next();
  }
  verifyToken(tokenType: string, tokenBody: string): boolean {
    switch (tokenType) {
      case 'utec':
        return verifyAuthToken(tokenBody, this.rtimeService.getTime());
      default:
        return false;
    }
  }
}
