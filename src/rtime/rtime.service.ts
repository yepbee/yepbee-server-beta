import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KEY_OPTIONS, RtimeId } from 'src/common/constants';
import { enumIncludes, throwException } from 'src/common/functions';
import { Repository, LessThan } from 'typeorm';
import {
  RtimeEntity,
  TABLE_NAME,
  TABLE_UNIXTIME,
  TABLE_RTIMEID,
} from './entities/rtime.entity';
import { Rtime, RtimeModuleOptions } from './rtime.interface';

@Injectable()
export class RtimeService {
  private rtimes: Record<RtimeId, Rtime> = {} as any;

  static isRtimeId(id: any): id is RtimeId {
    return enumIncludes(RtimeId, id);
  }
  static passRtimeId(id: any): void | never {
    if (!id || !RtimeService.isRtimeId(id))
      throwException('Unexpected Rtime Id', HttpStatus.BAD_REQUEST);
  }

  constructor(
    @Inject(KEY_OPTIONS) private readonly options: RtimeModuleOptions,
    @InjectRepository(RtimeEntity)
    private readonly rtimeEntityRepository: Repository<RtimeEntity>,
  ) {
    for (const [id, interval] of Object.entries(this.options.intervals)) {
      if (RtimeService.isRtimeId(id)) {
        this.rtimes[id] = Rtime.new(interval);
        this.uncheckedSaveTime(id);
      } else {
        throw new Error(`Unexpected Rtime Id: ${id}`);
      }
    }
  }

  private async uncheckedSaveTime(id: RtimeId) {
    const entity = this.rtimeEntityRepository.create({
      rtimeId: id,
      rtime: this.rtimes[id].current,
      unixTime: this.rtimes[id].unixTime,
    });

    await this.rtimeEntityRepository.save(entity);
  }

  getTime(id: RtimeId): string {
    return this.rtimes[id].get();
  }
  async saveTime(id: RtimeId) {
    await this.uncheckedSaveTime(id);
  }
  update(id: RtimeId): boolean {
    return this.rtimes[id].verifedUpdate();
  }

  updateAndGetTime(id: RtimeId): string {
    this.rtimes[id].verifedUpdate(); // update
    return this.rtimes[id].get();
  }

  async updateAndSaveTime(id: RtimeId) {
    if (this.rtimes[id].verifedUpdate()) {
      await this.uncheckedSaveTime(id);
      // delete previous term\
      const query = this.rtimeEntityRepository
        .createQueryBuilder(TABLE_NAME)
        .select(`MIN(${TABLE_UNIXTIME})`)
        .where(`${TABLE_RTIMEID} = :id`, { id });

      const minUnixTime = (await query.getRawOne())['min'];
      const currentUnixTime = this.rtimes[id].unixTime;
      const preservedTime = this.options.preservedTime;
      if (currentUnixTime - minUnixTime >= preservedTime * 3) {
        await this.rtimeEntityRepository.delete({
          rtimeId: id,
          unixTime: LessThan(minUnixTime + preservedTime),
        }); // preserve one box and delete another box
        // console.log(
        //   'deleted: ',
        //   minUnixTime,
        //   'to',
        //   minUnixTime + preservedTime,
        // );
      }
    } // update and save
  }
}
