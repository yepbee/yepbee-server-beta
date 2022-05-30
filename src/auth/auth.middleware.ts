import { Injectable, NestMiddleware } from '@nestjs/common';
import { verifyAuthToken } from '@retrip/js';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { KEY_PUBKEY, KEY_RTIME, KEY_USER, RtimeId } from 'src/common/constants';
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
      // console.log(tokenType, tokenBody);
      if (tokenType && tokenBody && this.verifyToken(tokenType, tokenBody)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [pubkey, _, rtime] = tokenBody.split('.');
        // console.log(pubkey, rtime);
        req[KEY_RTIME] = rtime;
        req[KEY_PUBKEY] = pubkey;
        // console.log(req[KEY_PUBKEY]);
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
        const currentRtime = this.rtimeService.updateAndGetTime(
          RtimeId.AuthToken,
        );
        console.log('currentServerRtime:', currentRtime);
        return verifyAuthToken(tokenBody, currentRtime);
      default:
        return false;
    }
  }
}
