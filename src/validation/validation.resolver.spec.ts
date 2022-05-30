import { Test, TestingModule } from '@nestjs/testing';
import { ValidationResolver } from './validation.resolver';

describe('ValidationResolver', () => {
  let resolver: ValidationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationResolver],
    }).compile();

    resolver = module.get<ValidationResolver>(ValidationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
