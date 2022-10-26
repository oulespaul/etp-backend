import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { Between } from 'typeorm';
import { TradeService } from 'src/trade/trade.service';
import { ESPService } from './esp.service';

@Injectable()
export class TradeRequestService {
  constructor(
    private tradeService: TradeService,
    private espService: ESPService,
  ) {}

  private readonly logger = new Logger(TradeRequestService.name);

  @Cron('50 * * * * *')
  async handleCron() {
    const startCurHour = dayjs().set('minute', 0).set('second', 0).toString();
    const endCurHour = dayjs().set('minute', 59).set('second', 59).toString();
    const nextHour = dayjs().add(1, 'hour').format('YYYYMMDDHH0000');
    this.logger.debug(
      `Starting trade request from ${startCurHour} to ${endCurHour}`,
    );

    const trades = await this.tradeService.findTradeByDateRange(
      Between(new Date(startCurHour), new Date(endCurHour)),
    );

    if (trades.length === 0) {
      return this.logger.debug(`Trade is empty for request`);
    }

    await Promise.all(
      trades.map(async (trade) => {
        const req = {
          clientId: parseInt(trade.incomingAccountNo),
          transactionDateTime: nextHour,
          tradeType: trade.incomingOrderSide === 'buy' ? 10 : 20,
          transactionId: `OB${trade.bookOrderId}`,
          refId: `TB${trade.tradeId}`,
          duration: 60,
          volume: parseFloat(trade.quantity.toString()),
          unitPrice: parseFloat(trade.price.toString()),
        };

        const result = await this.espService.tradeRequest(req);

        if (result.data) {
          this.tradeService.updateTradeRequested(trade.tradeId);
        }
      }),
    );
  }
}
