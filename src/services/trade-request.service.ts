import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { Between } from 'typeorm';
import { TradeService } from 'src/trade/trade.service';
import { ESPService } from './esp.service';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class TradeRequestService {
  constructor(
    private tradeService: TradeService,
    private espService: ESPService,
    private blockchainService: BlockchainService,
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
        const reqTaker = {
          clientId: parseInt(trade.incomingAccountNo),
          transactionDateTime: nextHour,
          tradeType: trade.incomingOrderSide === 'buy' ? 10 : 20,
          transactionId: `OB${trade.incomingOrderId}`,
          refId: `TB${trade.tradeId}|OB${trade.incomingOrderId}`,
          duration: 60,
          volume: parseFloat(trade.quantity.toString()),
          unitPrice: parseFloat(trade.price.toString()),
        };

        const resultTaker = await this.espService.tradeRequest(reqTaker);

        if (!resultTaker) {
          return this.logger.debug(`TradeConfirmation taker is error`);
        }

        const reqMaker = {
          clientId: parseInt(trade.bookOrderAccountNo),
          transactionDateTime: nextHour,
          tradeType: trade.incomingOrderSide === 'buy' ? 20 : 10,
          transactionId: `OB${trade.bookOrderId}`,
          refId: `TB${trade.tradeId}|OB${trade.bookOrderId}`,
          duration: 60,
          volume: parseFloat(trade.quantity.toString()),
          unitPrice: parseFloat(trade.price.toString()),
        };

        const resultMaker = await this.espService.tradeRequest(reqMaker);

        if (resultMaker && resultMaker.data) {
          this.tradeService.updateTradeRequested(trade.tradeId);
        }
      }),
    );
  }

  @Cron('*/5 * * * * *')
  async handleStampToBlockchainCron() {
    this.logger.debug(`Starting stamp blockchain`);

    const tradeConfirmationList =
      await this.tradeService.getUnStampBlockTradeConfirmation();

    if (tradeConfirmationList.length === 0) {
      return this.logger.debug(`TradeConfirmationList is empty for stamp`);
    }

    await Promise.all(
      tradeConfirmationList.map(async (trade) => {
        const req = {
          user_id: trade.userId,
          transaction_id: `OB${trade.transactionId}`,
          ref_id: `TB${trade.refId}`,
          transaction_status: trade.status,
          trn_usage: trade.trnUsage,
          trade_total: trade.tradeTotal,
          time_stamp: Math.floor(trade.timestamp.getTime() / 1000),
        };

        const result = await this.blockchainService.stampToBlockchain(req);

        if (result.data && result.data.code === 1) {
          this.tradeService.updateTradeConfirmationStampBlock(
            trade.tradeConfirmationId,
          );
        }
      }),
    );
  }
}
