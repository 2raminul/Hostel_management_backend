import { Test, TestingModule } from '@nestjs/testing';
import { BankInfoService } from './bank-info.service';

describe('BankInfoService', () => {
  let service: BankInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankInfoService],
    }).compile();

    service = module.get<BankInfoService>(BankInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
