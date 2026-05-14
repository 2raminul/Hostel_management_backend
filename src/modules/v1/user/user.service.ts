import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectConnection, Knex } from 'nestjs-knex';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.hmDb('users')
      .where('email', createUserDto.email)
      .whereNull('deleted_at')
      .first();
    if (existing) {
      throw new BadRequestException('Email already in use.');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password || 'changeme123', 10);
    const name = `${createUserDto.firstName} ${createUserDto.lastName}`;
    const [id] = await this.hmDb('users').insert({
      name,
      email: createUserDto.email,
      password: hashedPassword,
      is_active: true,
    });
    return { id, name, email: createUserDto.email };
  }

  async findAll() {
    const rows = await this.hmDb('users')
      .select('id', 'name', 'email', 'is_active')
      .whereNull('deleted_at')
      .orderBy('id', 'desc');
    return rows.map(({ is_active, ...rest }) => ({
      ...rest,
      isActive: Boolean(is_active),
    }));
  }

  async findOne(id: number) {
    const user = await this.hmDb('users')
      .select('id', 'name', 'email', 'is_active')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: Boolean((user as { is_active: number }).is_active),
    };
  }

  async findByEmail(email: string) {
    return this.hmDb('users')
      .where({ email, is_active: true })
      .whereNull('deleted_at')
      .select('id', 'name', 'email', 'password')
      .first();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const updateData: Record<string, any> = {};
    if (updateUserDto.firstName || updateUserDto.lastName) {
      const current = await this.findOne(id);
      const [firstName, ...rest] = current.name.split(' ');
      updateData.name = [
        updateUserDto.firstName || firstName,
        updateUserDto.lastName || rest.join(' '),
      ].join(' ');
    }
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (Object.keys(updateData).length === 0) return;
    await this.hmDb('users').update(updateData).where('id', id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.hmDb('users')
      .update({ deleted_at: new Date(), is_active: false })
      .where('id', id);
  }
}
