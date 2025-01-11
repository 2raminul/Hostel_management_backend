import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import * as bcrypt from 'bcrypt';
import { AuthToken } from '../../auth/entities/auth-token.entity';
import { Role } from './role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true })
  @Index('usersUniqueEmail', { unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: false })
  @Index('usersUniquePhone', { unique: true })
  phone: string;

  @Column({ default: false })
  isActive: boolean;

  // @Column({ default: 'customer' })
  // role: string;

  @OneToMany(() => AuthToken, (authToken) => authToken.user, {
    cascade: true,
  })
  authTokens: AuthToken[];

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @BeforeInsert()
  async hashPassword() {
    this.password = this.passwordHash(this.password);
  }

  passwordHash(plainPassword: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainPassword, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
