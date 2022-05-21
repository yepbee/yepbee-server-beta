import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  home(): string {
    return this.appService.welcome();
  }

  @Get('/rtime')
  rtime(): string {
    return this.appService.rtime();
  }
}
