import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventModule } from './events/event.module';
import { OrderbookModule } from './order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ClearingOrderTaskService } from './services/clearing-orderbook.service';
import { TradeModule } from './trade/trade.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    EventModule,
    OrderbookModule,
    TradeModule,
    AuthModule,
  ],
  providers: [ClearingOrderTaskService, AuthService],
})
export class AppModule {}
