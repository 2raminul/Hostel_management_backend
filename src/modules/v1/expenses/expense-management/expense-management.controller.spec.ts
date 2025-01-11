import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseManagementController } from './expense-management.controller';

describe('ExpenseManagementController', () => {
  let controller: ExpenseManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseManagementController],
    }).compile();

    controller = module.get<ExpenseManagementController>(ExpenseManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
