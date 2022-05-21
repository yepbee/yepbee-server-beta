import { Inject, Injectable } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { Rtime, RtimeModuleOptions } from './rtime.interface';

@Injectable()
export class RtimeService {
  private time: Rtime;
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: RtimeModuleOptions,
  ) {
    this.time = Rtime.new(options.interval);
  }
  getTime(): string {
    this.time.verifedUpdate();
    return this.time.get();
  }
}
