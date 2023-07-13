import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class TradebookConfirmation {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'orderbook_id' })
  orderbookId: number;

  @Column({ name: 'tradebook_id' })
  tradebookId: number;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'trn_usage', type: 'decimal', precision: 20, scale: 8 })
  trnUsage: number;

  @Column({ name: 'total', type: 'decimal', precision: 20, scale: 8 })
  total: number;

  @Column({ name: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'is_stamp_blocked', default: false })
  isStampBlock: boolean;
}
