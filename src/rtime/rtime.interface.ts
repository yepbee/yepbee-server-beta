import { nanoid } from 'nanoid';
import { RtimeId } from 'src/common/constants';
import { getUnixTime } from 'src/common/functions';
import { RTIME_LENGTH } from './rtime.constant';

export type RtimeModuleOptions = {
  length: number;
  intervals: Record<RtimeId, number>;
  preservedTime: number;
};

export class Rtime {
  unixTime: number;
  current: string;
  static new(interval: number): Rtime {
    return new Rtime(interval);
  }
  static generate(interval: number): Rtime {
    return new Rtime(interval);
  }
  constructor(private readonly interval: number) {
    this.reset();
  }
  reset() {
    this.unixTime = getUnixTime();
    this.current = nanoid(RTIME_LENGTH);
  }
  verifedUpdate(): boolean {
    if (getUnixTime() > this.unixTime + this.interval) {
      this.reset();
      return true;
    }
    return false;
  }
  get(): string {
    return this.current;
  }
}
