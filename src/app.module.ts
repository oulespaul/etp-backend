import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventModule } from './events/event.module';
import { OrderbookModule } from './order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ClearingOrderTaskService } from './services/clearing-orderbook.service';
import { TradeModule } from './trade/trade.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { TradeRequestService } from './services/trade-request.service';
import { ESPService } from './services/esp.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    EventModule,
    OrderbookModule,
    TradeModule,
    AuthModule,
    HttpModule,
  ],
  providers: [
    ClearingOrderTaskService,
    AuthService,
    TradeRequestService,
    ESPService,
  ],
})
export class AppModule {}
