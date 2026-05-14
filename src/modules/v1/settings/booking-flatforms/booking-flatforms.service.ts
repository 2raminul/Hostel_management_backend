import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { CreateBookingFlatformsDto } from './dto/create-booking-flatforms.dto';
import { UpdateBookingPlatformsDto } from './dto/update-booking-flatforms.dto';

@Injectable()
export class BookingFlatformsService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  async create(dto: CreateBookingFlatformsDto) {
    const [id] = await this.hmDb('booking_platforms').insert({
      name: dto.name,
      status: dto.status ?? true,
    });
    return { id };
  }

  async findAll() {
    return this.hmDb('booking_platforms')
      .select('id', 'name', 'status')
      .whereNull('deleted_at')
      .orderBy('id', 'desc');
  }

  async findOne(id: number) {
    const record = await this.hmDb('booking_platforms')
      .select('id', 'name', 'status')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
    if (!record) {
      throw new NotFoundException('Booking platform not found.');
    }
    return record;
  }

  async update(id: number, dto: UpdateBookingPlatformsDto) {
    await this.findOne(id);
    await this.hmDb('booking_platforms')
      .update({ name: dto.name, status: dto.status })
      .where('id', id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.hmDb('booking_platforms')
      .update({ deleted_at: new Date() })
      .where('id', id);
  }
}
