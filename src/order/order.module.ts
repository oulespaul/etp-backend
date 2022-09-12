import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orderbook } from '../entities/orderbook.entity';
import { OrderBookController } from './order.controller';
import { OrderbookService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Orderbook])],
  controllers: [OrderBookController],
  providers: [OrderbookService],
  exports: [OrderbookService],
})
export class OrderbookModule {}
