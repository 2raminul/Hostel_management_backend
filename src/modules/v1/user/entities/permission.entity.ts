// permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Example: 'MANAGE_ALL_DATA', 'MANAGE_CATEGORY', 'VIEW_CATEGORY'

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
