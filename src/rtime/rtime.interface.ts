import { nanoid } from 'nanoid';
import { getUnixTime } from 'src/common/functions';

export type RtimeModuleOptions = {
  interval: number;
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
    this.current = nanoid();
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
