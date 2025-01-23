import { Test, TestingModule } from '@nestjs/testing';
import { OnlineCardsInfoController } from './online-cards-info.controller';

describe('OnlineCardsInfoController', () => {
  let controller: OnlineCardsInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnlineCardsInfoController],
    }).compile();

    controller = module.get<OnlineCardsInfoController>(OnlineCardsInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
