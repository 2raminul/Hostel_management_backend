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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { CurrentUser } from '../../../common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';

@ApiTags('Rooms')
@UseGuards(AuthenticatedUserGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // ─── Rooms ───────────────────────────────────────────────────────────

  @Post()
  createRoom(@Body() dto: CreateRoomDto, @CurrentUser() user: RequestUser) {
    return this.roomsService.createRoom(dto, user);
  }

  @Get()
  findAllRooms() {
    return this.roomsService.findAllRooms();
  }

  @Get(':id')
  findOneRoom(@Param('id') id: string) {
    return this.roomsService.findOneRoom(+id);
  }

  @Patch(':id')
  updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roomsService.updateRoom(+id, dto, user);
  }

  @Delete(':id')
  removeRoom(@Param('id') id: string) {
    return this.roomsService.removeRoom(+id);
  }

  // ─── Beds ─────────────────────────────────────────────────────────────

  @Post('beds')
  createBed(@Body() dto: CreateBedDto, @CurrentUser() user: RequestUser) {
    return this.roomsService.createBed(dto, user);
  }

  @Get('beds/:id')
  findOneBed(@Param('id') id: string) {
    return this.roomsService.findOneBed(+id);
  }

  @Patch('beds/:id')
  updateBed(
    @Param('id') id: string,
    @Body() dto: UpdateBedDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roomsService.updateBed(+id, dto, user);
  }

  @Delete('beds/:id')
  removeBed(@Param('id') id: string) {
    return this.roomsService.removeBed(+id);
  }
}
