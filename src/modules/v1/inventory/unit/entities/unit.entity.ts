import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Item } from '../../item/entities/item.entity';

@Entity('units')
export class Unit extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  shortName: string;

  @OneToMany(() => Item, (item) => item.unit, {
    createForeignKeyConstraints: true,
  })
  items: Item[];

  @Column({ nullable: true })
  status: boolean;
}
