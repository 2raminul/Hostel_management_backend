import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { RequestUser } from '../auth/type/request-user';

@Injectable()
export class RoomsService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  // ─── Rooms ───────────────────────────────────────────────────────────

  async createRoom(dto: CreateRoomDto, user: RequestUser) {
    const existing = await this.hmDb('rooms')
      .where('room_number', dto.roomNumber)
      .whereNull('deleted_at')
      .first();
    if (existing) {
      throw new BadRequestException('Room number already exists.');
    }
    const trx = await this.hmDb.transaction();
    try {
      const [roomId] = await trx('rooms').insert({
        room_number: dto.roomNumber,
        description: dto.description ?? null,
        total_beds: dto.totalBeds,
        created_by: user.userId,
        updated_by: user.userId,
      });
      // Auto-create beds labelled A, B, C ...
      const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const beds = Array.from({ length: dto.totalBeds }, (_, i) => ({
        room_id: roomId,
        bed_label: labels[i] || `${i + 1}`,
        is_occupied: false,
        created_by: user.userId,
        updated_by: user.userId,
      }));
      await trx('beds').insert(beds);
      await trx.commit();
      return { id: roomId };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async findAllRooms() {
    const rooms = await this.hmDb('rooms as r')
      .select(
        'r.id',
        'r.room_number as roomNumber',
        'r.description',
        'r.total_beds as totalBeds',
      )
      .whereNull('r.deleted_at')
      .orderBy('r.room_number');

    const bedCounts = await this.hmDb('beds')
      .select(
        'room_id',
        this.hmDb.raw('COUNT(id) AS total'),
        this.hmDb.raw(
          'SUM(CASE WHEN is_occupied = 1 THEN 1 ELSE 0 END) AS occupied',
        ),
      )
      .whereNull('deleted_at')
      .groupBy('room_id');

    const bedMap = new Map(
      bedCounts.map((b: any) => [Number(b.room_id), b]),
    );

    return rooms.map((r) => {
      const counts: any =
        bedMap.get(Number(r.id)) || { total: 0, occupied: 0 };
      return {
        ...r,
        occupiedBeds: Number(counts.occupied),
        availableBeds: Number(counts.total) - Number(counts.occupied),
      };
    });
  }

  async findOneRoom(id: number) {
    const room = await this.hmDb('rooms')
      .select('id', 'room_number as roomNumber', 'description', 'total_beds as totalBeds')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
    if (!room) {
      throw new NotFoundException('Room not found.');
    }
    const beds = await this.hmDb('beds')
      .select('id', 'bed_label as bedLabel', 'is_occupied as isOccupied', 'remarks')
      .where('room_id', id)
      .whereNull('deleted_at')
      .orderBy('bed_label');
    return { ...room, beds };
  }

  async updateRoom(id: number, dto: UpdateRoomDto, user: RequestUser) {
    await this.findOneRoom(id);
    await this.hmDb('rooms')
      .update({
        room_number: dto.roomNumber,
        description: dto.description,
        total_beds: dto.totalBeds,
        updated_by: user.userId,
      })
      .where('id', id);
  }

  async removeRoom(id: number) {
    await this.findOneRoom(id);
    await this.hmDb('rooms').update({ deleted_at: new Date() }).where('id', id);
    await this.hmDb('beds').update({ deleted_at: new Date() }).where('room_id', id);
  }

  // ─── Beds ─────────────────────────────────────────────────────────────

  async createBed(dto: CreateBedDto, user: RequestUser) {
    await this.findOneRoom(dto.roomId);
    const [id] = await this.hmDb('beds').insert({
      room_id: dto.roomId,
      bed_label: dto.bedLabel,
      is_occupied: false,
      remarks: dto.remarks ?? null,
      created_by: user.userId,
      updated_by: user.userId,
    });
    return { id };
  }

  async findOneBed(id: number) {
    const bed = await this.hmDb('beds as b')
      .select(
        'b.id',
        'b.bed_label as bedLabel',
        'b.is_occupied as isOccupied',
        'b.remarks',
        'r.room_number as roomNumber',
        'r.id as roomId',
      )
      .join('rooms as r', 'r.id', '=', 'b.room_id')
      .where('b.id', id)
      .whereNull('b.deleted_at')
      .first();
    if (!bed) {
      throw new NotFoundException('Bed not found.');
    }
    return bed;
  }

  async updateBed(id: number, dto: UpdateBedDto, user: RequestUser) {
    await this.findOneBed(id);
    await this.hmDb('beds')
      .update({
        bed_label: dto.bedLabel,
        remarks: dto.remarks,
        updated_by: user.userId,
      })
      .where('id', id);
  }

  async removeBed(id: number) {
    await this.findOneBed(id);
    await this.hmDb('beds').update({ deleted_at: new Date() }).where('id', id);
  }
}
