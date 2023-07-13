import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradebookConfirmation } from 'src/entities/tradebook-confirmation.entity';
import { Tradebook } from 'src/entities/tradebook.entity';
import { InvoiceService } from 'src/services/invoice.service';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { ESPService } from 'src/services/esp.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tradebook, TradebookConfirmation]),
    HttpModule,
  ],
  controllers: [TradeController],
  providers: [TradeService, InvoiceService, ESPService],
  exports: [TradeService],
})
export class TradeModule {}
