import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RtimeId } from 'src/common/constants';
import { RtimeEntity } from 'src/rtime/entities/rtime.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(RtimeEntity)
    private readonly rtimeEntityRepository: Repository<RtimeEntity>,
  ) {}
  async findAndMapAllRtimes<T extends object & { rtime: string }>(
    arr: T[],
  ): Promise<(T & { unixTime: number })[]> | never {
    const result = [];
    console.log('-----', arr);
    for (const [idx, obj] of arr.entries()) {
      console.log('--------', idx, obj);
      const one = await this.rtimeEntityRepository.findOne({
        where: {
          rtimeId: RtimeId.Walking,
          rtime: obj.rtime,
        },
      });
      console.log(one);
      if (!one) throw new Error(`Unexpected rtime found`);
      result[idx] = { ...obj, unixTime: one.unixTime };
    }
    return result;
  }
}
