import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { Between } from 'typeorm';
import { TradeService } from 'src/trade/trade.service';
import { ESPService } from './esp.service';
import { BlockchainService } from './blockchain.service';
import { MAKER_TAKER } from 'src/constants/maker-taker.enum';
import { TradeRequestDto } from 'src/trade/dto/trade-request.dto';

@Injectable()
export class TradeRequestService {
  constructor(
    private tradeService: TradeService,
    private espService: ESPService,
    private blockchainService: BlockchainService,
  ) {}

  private readonly logger = new Logger(TradeRequestService.name);

  // For send trade request (local)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const startCurHour = dayjs().set('minute', 0).set('second', 0).toString();
    const endCurHour = dayjs().set('minute', 59).set('second', 59).toString();

    this.logger.debug(
      `Starting trade request from ${startCurHour} to ${endCurHour}`,
    );

    const trades = await this.tradeService.findTradeByDateRange(
      Between(new Date(startCurHour), new Date(endCurHour)),
      true,
    );

    if (trades.length === 0) {
      return this.logger.debug(`Trade is empty for request`);
    }

    await Promise.all(
      trades.map(async (trade) => {
        const reqTaker = TradeRequestDto.toModel(trade, MAKER_TAKER.TAKER);

        const resultTaker = await this.espService.tradeRequest(reqTaker);

        if (!resultTaker) {
          return this.logger.debug(`TradeConfirmation taker is error`);
        }

        const reqMaker = TradeRequestDto.toModel(trade, MAKER_TAKER.MAKER);

        const resultMaker = await this.espService.tradeRequest(reqMaker);

        if (!resultMaker) {
          return this.logger.debug(`TradeConfirmation maker is error`);
        }

        this.tradeService.updateTradeRequested(trade.tradeId);
      }),
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
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
