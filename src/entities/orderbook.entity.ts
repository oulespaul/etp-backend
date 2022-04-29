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
  accountNo: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({
    name: 'remaining_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  remainingQuantity: number;

  @Column({ name: 'status', default: 'working' })
  status: string;

  @CreateDateColumn({ name: 'order_time' })
  orderTime: Date;
}
