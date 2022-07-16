import { Injectable } from '@nestjs/common';
import { verifyAuthToken } from '@retrip/js';
import { RtimeId } from 'src/common/constants';
import { HeaderTokenType } from 'src/common/interfaces';
import { RtimeService } from 'src/rtime/rtime.service';

type HeaderToken = [string, string];

@Injectable()
export class TokenService {
  constructor(private readonly rtimeService: RtimeService) {}
  protected _split(authorization: string): HeaderToken | undefined {
    const splited = authorization.split(' ');
    if (splited.length !== 2) return;
    return splited as HeaderToken;
  }
  protected _verify(tokenType: string, tokenBody: string): boolean {
    switch (tokenType as HeaderTokenType) {
      case 'utec':
        const currentRtime = this.rtimeService.updateAndGetTime(
          RtimeId.AuthToken,
        );
        return verifyAuthToken(tokenBody, currentRtime);
      default:
        return false;
    }
  }
  verify(authorization: string): boolean {
    const splited = this._split(authorization);
    return splited && this._verify(...splited);
  }
  verifyAndSplit(authorization: string): HeaderToken | undefined {
    const splited = this._split(authorization);
    return this._verify(...splited) ? splited : undefined;
  }
}
