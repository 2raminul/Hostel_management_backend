import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/entity/base.entity';

@Entity('booking-flatforms')
export class BookingFlatforms extends BaseEntity{
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  status: boolean;
}