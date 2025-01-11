import { Test, TestingModule } from '@nestjs/testing';
import { BookingFlatformsService } from './booking-flatforms.service';

describe('BookingFlatformsService', () => {
  let service: BookingFlatformsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingFlatformsService],
    }).compile();

    service = module.get<BookingFlatformsService>(BookingFlatformsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
