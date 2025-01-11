import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseManagementService } from './expense-management.service';

describe('ExpenseManagementService', () => {
  let service: ExpenseManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseManagementService],
    }).compile();

    service = module.get<ExpenseManagementService>(ExpenseManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
