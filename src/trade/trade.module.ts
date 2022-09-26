import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradebookConfirmation } from 'src/entities/tradebook-confirmation.entity';
import { Tradebook } from 'src/entities/tradebook.entity';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tradebook, TradebookConfirmation])],
  controllers: [TradeController],
  providers: [TradeService],
  exports: [TradeService],
})
export class TradeModule {}
