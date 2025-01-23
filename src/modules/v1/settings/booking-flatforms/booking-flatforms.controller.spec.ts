import { Test, TestingModule } from '@nestjs/testing';
import { BookingFlatformsController } from './booking-flatforms.controller';

describe('BookingFlatformsController', () => {
  let controller: BookingFlatformsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingFlatformsController],
    }).compile();

    controller = module.get<BookingFlatformsController>(
      BookingFlatformsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
