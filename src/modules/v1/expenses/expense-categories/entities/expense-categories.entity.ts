import { BaseEntity } from '@/common/entity/base.entity';
import { Column } from 'typeorm';


// Define the Enum
export enum ExpenseType {
  FIXED = 'Fixed Expenses',
  VARIABLE = 'Variable Expenses',
}
export class ExpenseCategories extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: ExpenseType, // Reference the enum here
    nullable: false,
  })
  expenseType: ExpenseType; // Use the enum as the type
}