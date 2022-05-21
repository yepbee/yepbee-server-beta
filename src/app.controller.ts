import { Controller, Get, Query } from '@nestjs/common';
import { keypairToAuthToken, Keypair } from '@retrip/js';
import { AppService } from './app.service';
import { CoreResult } from './common/interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  test(): Promise<string> {
    const keypair = Keypair.generate();
    return keypairToAuthToken(keypair);
  }

  @Get()
  home(): string {
    return this.appService.welcome();
  }

  @Get('/rtime')
  rtime(): string {
    return this.appService.rtime();
  }

  @Get('/confirm')
  confirm(@Query('code') code: string): Promise<CoreResult> {
    return this.appService.confirm(code);
  }
}
