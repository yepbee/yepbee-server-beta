import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { keypairToAuthToken, Keypair } from '@retrip/js';
import { AppService } from './app.service';
import { GLOBAL_OPTIONS, RtimeId } from './common/constants';
import { throwException } from './common/functions';
import { CoreResult } from './common/interfaces';
import { RtimeService } from './rtime/rtime.service';
import { Web3Service } from './web3/web3.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly web3Service: Web3Service,
  ) {}

  // for the test purpose
  @Get('test')
  test(): Promise<string> {
    const keypair = Keypair.generate();
    return keypairToAuthToken(keypair, [
      `${GLOBAL_OPTIONS.getOne('baseUrl')}/`,
    ]);
  }

  @Get()
  home(): string {
    return this.appService.welcome();
  }

  @Get('/pubkey')
  pubkey(@Query('id') id: string): string {
    if (!id || id !== 'Master')
      throwException('Unexpected Rtime Id', HttpStatus.BAD_REQUEST);

    return this.web3Service.masterPubkey.toString();
  }

  @Get('/rtime')
  rtime(@Query('id') id: RtimeId): Promise<string> {
    RtimeService.passRtimeId(id);
    // !TODO: Walking Guard
    // , @AuthUser() user: User)
    // if (id === RtimeId.Walking && !user)
    //   throwException('Forbidden', HttpStatus.FORBIDDEN);

    return this.appService.rtime(id);
  }

  @Get('/confirm')
  confirm(@Query('code') code: string): Promise<CoreResult> {
    return this.appService.confirm(code);
  }
}
