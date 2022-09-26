import { Module } from '@nestjs/common';
import { OrderbookModule } from 'src/order/order.module';
import { TradeModule } from 'src/trade/trade.module';
import { EventGateway } from './event.gateway';

@Module({
  imports: [OrderbookModule, TradeModule],
  providers: [EventGateway],
})
export class EventModule {}
