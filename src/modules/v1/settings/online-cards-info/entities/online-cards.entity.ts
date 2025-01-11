import { Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Bank } from '../../bank-info/entities/bank.entity';
  
export class OnlineCards extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @OneToOne(() => Bank, (bank) => bank.card, {
    onDelete: 'SET NULL', // Set bankId to NULL when the associated bank is deleted
    eager: false, // Prevent automatic loading unless explicitly requested
  })
  @JoinColumn({ name: 'bankId' }) // Specify the foreign key column
  bank: Bank;

  @Column({ nullable: true })
  cardNumber: number  

  @Column({ nullable: true })
  status: boolean;

}