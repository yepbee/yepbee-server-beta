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
    for await (const [idx, { h3, rtime }] of arr.entries()) {
      const one = await this.rtimeEntityRepository.findOneBy({
        rtimeId: RtimeId.Walking,
        rtime,
      });
      console.log(one);
      if (!one) throw new Error(`Unexpected RTime Found`);
      result[idx] = { h3, unixTime: one.unixTime };
    }
    return result;
  }
}
