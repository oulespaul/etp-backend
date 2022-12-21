import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'key', length: 100 })
  key: string;

  @Column({ name: 'clientId', length: 100 })
  clientId: string;

  @Column({ name: 'station', length: 100 })
  station: string;

  @Column({ name: 'station_name', length: 100 })
  stationName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
