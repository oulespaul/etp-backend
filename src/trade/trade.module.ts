import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradebookConfirmation } from 'src/entities/tradebook-confirmation.entity';
import { Tradebook } from 'src/entities/tradebook.entity';
import { InvoiceService } from 'src/services/invoice.service';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tradebook, TradebookConfirmation])],
  controllers: [TradeController],
  providers: [TradeService, InvoiceService],
  exports: [TradeService],
})
export class TradeModule {}
