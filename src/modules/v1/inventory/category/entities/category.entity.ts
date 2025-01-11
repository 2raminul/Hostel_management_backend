import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Item } from '../../item/entities/item.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => Item, (item) => item.category, {
    createForeignKeyConstraints: true,
    cascade: true,
  })
  items: Item[];

  @Column({ nullable: true })
  status: boolean;
}
