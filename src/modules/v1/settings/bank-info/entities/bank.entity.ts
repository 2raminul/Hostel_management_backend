import { Column, OneToOne } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { OnlineCards } from '../../online-cards-info/entities/online-cards.entity';

// Define the Enum
export enum AccountType {
  PERSONAL = 'Personal Account',
  BUSINESS = 'Business Account',
}
  
export class Bank extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType, // Reference the enum here
    nullable: false,
  })
  accountType: AccountType; // Use the enum as the type

  @Column({ nullable: true })
  accountNumber;

  @OneToOne(() => OnlineCards, (card) => card.bank, {
    cascade: true, // Automatically persist/delete associated card
  })
  card: OnlineCards;

  @Column({ nullable: true })
  status: boolean;

}