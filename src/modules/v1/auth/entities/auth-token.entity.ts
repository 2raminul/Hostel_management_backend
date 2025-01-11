import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('auth_tokens')
export class AuthToken extends BaseEntity {
  @Column({ nullable: false })
  accessToken: string;

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ nullable: false, type: 'timestamptz' })
  refreshTokenExpireAt: Date;

  @ManyToOne(() => User, (user) => user.authTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
