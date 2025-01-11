import { Test, TestingModule } from '@nestjs/testing';
import { OnlineCardsInfoService } from './online-cards-info.service';

describe('OnlineCardsInfoService', () => {
  let service: OnlineCardsInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlineCardsInfoService],
    }).compile();

    service = module.get<OnlineCardsInfoService>(OnlineCardsInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
