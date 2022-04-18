import { Module } from '@nestjs/common';
import { OrderbookModule } from 'src/order/order.module';
import { EventGateway } from './event.gateway';

@Module({
  imports: [OrderbookModule],
  providers: [EventGateway],
})
export class EventModule {}
