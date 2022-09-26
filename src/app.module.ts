import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventModule } from './events/event.module';
import { OrderbookModule } from './order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ClearingOrderTaskService } from './services/clearing-orderbook.service';
import { TradeModule } from './trade/trade.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    EventModule,
    OrderbookModule,
    TradeModule,
  ],
  providers: [ClearingOrderTaskService],
})
export class AppModule {}
