import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor() {}

  async create(createUserDto: CreateUserDto) {
    return;
  }

  async findAll() {}

  async findOne(id: number, relation?: string[]) {}

  async findByEmail(email: string) {}

  async findByPhoneNumber(phone: string) {}

  async update(id: number, updateUserDto: UpdateUserDto) {}

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
