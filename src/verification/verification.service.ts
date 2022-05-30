import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RtimeId } from 'src/common/constants';
import { RtimeEntity } from 'src/rtime/entities/rtime.entity';
import { EnqueueValidatingData } from 'src/validation/dtos/enqueueValidating.dto';
import { Repository } from 'typeorm';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(RtimeEntity)
    private readonly rtimeEntityRepository: Repository<RtimeEntity>,
  ) {}
  async findRtimes(
    arr: EnqueueValidatingData[],
  ): Promise<{ h3: string; unixTime: number }[]> | never {
    const result = [];
    console.log('-----', arr);
    for (const [idx, { h3, rtime }] of arr.entries()) {
      console.log('--------', idx, h3, rtime);
      const one = await this.rtimeEntityRepository.findOne({
        where: {
          rtimeId: RtimeId.Walking,
          rtime,
        },
      });
      console.log(one);
      if (!one) throw new Error(`Unexpected rtime found`);
      result[idx] = { h3, unixTime: one.unixTime };
    }
    return result;
  }
}
