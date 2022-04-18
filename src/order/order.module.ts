import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orderbook } from '../entities/orderbook.entity';
import { OrderbookService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Orderbook])],
  providers: [OrderbookService],
  exports: [OrderbookService],
})
export class OrderbookModule {}
