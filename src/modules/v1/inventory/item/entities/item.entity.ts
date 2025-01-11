import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Category } from '../../category/entities/category.entity';
import { Unit } from '../../unit/entities/unit.entity';

@Entity('items')
export class Item extends BaseEntity {
  @Column({ nullable: false })
  name: string;
   
  @Column({
    nullable: true,
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    nullable: true,
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  itemsUsed: number;

  @Column({ nullable: true, type: 'varchar', length: 30, default: 'Yes' })
  laundryItem: string;

  @Column({ nullable: true })
  status: boolean;

  //   @Column({ nullable: true })
  //   imageUrl: string;

  @Column({ nullable: false })
  quantity: number;
  

  @ManyToOne(() => Category, (category) => category.items, {
    onDelete: 'SET NULL', // Automatically remove items when a category is deleted
    eager: false, // Automatically fetch related category data
    //createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'categoryId' }) // Map the foreign key column to the category's primary key
  category: Category;

  // @Column()
  // unitId: number;

  @ManyToOne(() => Unit, (unit) => unit.items, {
    onDelete: 'SET NULL', // Set unit to null if deleted
    eager: false, // Automatically fetch related category data
    //createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;
}
