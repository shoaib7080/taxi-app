import { Test, TestingModule } from '@nestjs/testing';
import { RidesResolver } from './rides.resolver';
import { RidesService } from './rides.service';

describe('RidesResolver', () => {
  let resolver: RidesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RidesResolver, RidesService],
    }).compile();

    resolver = module.get<RidesResolver>(RidesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
