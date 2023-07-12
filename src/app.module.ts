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
import { UserModule } from './user/user.module';
import { BlockchainService } from './services/blockchain.service';
import { GlobalTradeService } from './services/global-trade.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    EventModule,
    OrderbookModule,
    TradeModule,
    AuthModule,
    HttpModule,
    UserModule,
  ],
  providers: [
    ClearingOrderTaskService,
    AuthService,
    TradeRequestService,
    ESPService,
    BlockchainService,
    GlobalTradeService,
  ],
})
export class AppModule {}
