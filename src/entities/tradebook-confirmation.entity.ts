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

  @Column({ name: 'trn_usage' })
  trnUsage: number;

  @Column({ name: 'total' })
  total: number;

  @Column({ name: 'timestamp' })
  timestamp: Date;
}
