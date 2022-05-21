import { Test, TestingModule } from '@nestjs/testing';
import { RtimeService } from './rtime.service';

describe('RtimeService', () => {
  let service: RtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RtimeService],
    }).compile();

    service = module.get<RtimeService>(RtimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
