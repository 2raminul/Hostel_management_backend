import { Test, TestingModule } from '@nestjs/testing';
import { BankInfoController } from './bank-info.controller';

describe('BankInfoController', () => {
  let controller: BankInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankInfoController],
    }).compile();

    controller = module.get<BankInfoController>(BankInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
