import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Orderbook {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column({ name: 'side', length: 10 })
  side: string;

  @Column({ name: 'order_type', length: 10 })
  orderType: string;

  @Column({ name: 'account_no' })
  accountNo: number;

  @Column({ name: 'price', type: 'decimal' })
  price: number;

  @Column({ name: 'quantity', type: 'decimal' })
  quantity: number;

  @Column({ name: 'remaining_quantity', type: 'decimal' })
  remainingQuantity: number;

  @Column({ name: 'status', default: 'working' })
  status: string;

  @CreateDateColumn({ name: 'order_time' })
  orderTime: Date;
}
