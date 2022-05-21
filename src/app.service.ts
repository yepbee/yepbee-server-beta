import { Injectable } from '@nestjs/common';
import { EnvService } from './env/env.service';
import { RtimeService } from './rtime/rtime.service';

@Injectable()
export class AppService {
  constructor(
    private readonly envService: EnvService,
    private readonly rtimeService: RtimeService,
  ) {}
  welcome(): string {
    return 'Welcome To Retrip!';
  }
  rtime(): string {
    return this.rtimeService.getTime();
  }
}
