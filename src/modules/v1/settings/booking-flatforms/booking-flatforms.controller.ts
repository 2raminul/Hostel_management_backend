import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookingFlatformsService } from './booking-flatforms.service';
import { CreateBookingFlatformsDto } from './dto/create-booking-flatforms.dto';
import { UpdateBookingPlatformsDto } from './dto/update-booking-flatforms.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserGuard } from '../../auth/guard/authenticated.user.guard';

@Controller('settings/booking-platforms')
@ApiTags('Settings - Booking Platforms')
@UseGuards(AuthenticatedUserGuard)
export class BookingFlatformsController {
  constructor(private readonly bookingFlatformsService: BookingFlatformsService) {}

  @Post()
  create(@Body() dto: CreateBookingFlatformsDto) {
    return this.bookingFlatformsService.create(dto);
  }

  @Get()
  findAll() {
    return this.bookingFlatformsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingFlatformsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookingPlatformsDto) {
    return this.bookingFlatformsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingFlatformsService.remove(+id);
  }
}
