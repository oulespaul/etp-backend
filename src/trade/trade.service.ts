import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TradebookConfirmation } from 'src/entities/tradebook-confirmation.entity';
import { Tradebook } from 'src/entities/tradebook.entity';
import { FindOperator, Repository } from 'typeorm';
import { ComfirmTradebookDto } from './dto/confirm-trade.dto';
import { CreateTradebookDto } from './dto/create-trade.dto';
import { getSessionSqlHour } from '../helpers/trade/sql/getSessionHour';
import { getSessionSqlDay } from '../helpers/trade/sql/getSessionDay';
import { getSessionSqlMonth } from '../helpers/trade/sql/getSessionMonth';
import { TradeSessionResponseDto } from './dto/trade-session-response';
import { getTradeConfirmationWithTradeDetail } from 'src/helpers/trade/sql/getTradeConfirmWithTradeDetail';
import { TradeConfirmationWithDetailDto } from './dto/trade-confirmation-with-detail.dto';
import { getMarketDataSummaryHour } from 'src/helpers/trade/sql/getMarketDataSummaryHour';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Tradebook)
    private tradebookRepository: Repository<Tradebook>,
    @InjectRepository(TradebookConfirmation)
    private tradebookConfirmationRepository: Repository<TradebookConfirmation>,
  ) {}

  async getAllTrade(): Promise<Tradebook[]> {
    return this.tradebookRepository.find();
  }

  async getTradeById(id: number): Promise<Tradebook> {
    return this.tradebookRepository.findOne(id);
  }

  async createTrade(createTrade: CreateTradebookDto): Promise<Tradebook> {
    const tradebook = this.tradebookRepository.create({
      ...createTrade,
      isTradeRequest: false,
    });

    return this.tradebookRepository.save(tradebook);
  }

  async createTradeConfirmation(
    confirmTrade: ComfirmTradebookDto,
  ): Promise<{ status: string; timestamp: Date }> {
    const tradeRefId = confirmTrade.refId.split('|')[0];
    const tradeId = Number(tradeRefId.split('NTTB')[1]);
    const tradebook = await this.getTradeById(tradeId);
    if (tradebook === undefined) {
      throw new BadRequestException('refId not found');
    }

    const tradebookConfirmation = this.tradebookConfirmationRepository.create({
      orderbookId: Number(confirmTrade.transactionId.split('NTOB')[1]),
      tradebookId: tradeId,
      status: confirmTrade.status,
      trnUsage: confirmTrade.trnUsage,
      total: confirmTrade.total,
      timestamp: new Date(confirmTrade.timestamp * 1000),
    });

    const tradeConfirmed = await this.tradebookConfirmationRepository.save(
      tradebookConfirmation,
    );

    return {
      status: tradeConfirmed.status,
      timestamp: tradeConfirmed.timestamp,
    };
  }

  async findTradeByDateRange(
    dateRange: FindOperator<Date>,
    isLocal: boolean,
  ): Promise<Tradebook[]> {
    return this.tradebookRepository.find({
      where: {
        isTradeRequest: false,
        tradeTime: dateRange,
        isLocal,
      },
    });
  }

  async updateTradeRequested(tradeId: number): Promise<Tradebook> {
    const tradebook = await this.getTradeById(tradeId);

    if (tradebook === undefined) {
      throw new BadRequestException('refId not found');
    }

    tradebook.isTradeRequest = true;

    return this.tradebookRepository.save(tradebook);
  }

  async getSessionTrade(
    timeframe = 'hour',
  ): Promise<TradeSessionResponseDto[]> {
    const sessionSqlMap = {
      hour: getSessionSqlHour,
      day: getSessionSqlDay,
      month: getSessionSqlMonth,
    };
    const sql = sessionSqlMap[timeframe];

    return this.tradebookRepository.query(sql);
  }

  async getMonthlyTradeConfirmation(accountNo: number) {
    return this.tradebookConfirmationRepository
      .createQueryBuilder('tc')
      .select('t.incoming_account_no', 'accountNo')
      .addSelect('SUM(tc.trn_usage)', 'trnUsage')
      .addSelect('SUM(tc.trn_usage * t.price)', 'value')
      .leftJoin('tradebook', 't', 'tc.tradebook_id = t.trade_id')
      .where('YEAR(tc.`timestamp`) = YEAR(NOW())')
      .andWhere('MONTH(tc.`timestamp`) = MONTH(NOW())')
      .andWhere('t.incoming_account_no = :accountNo', { accountNo })
      .groupBy('t.incoming_account_no')
      .getRawOne();
  }

  async getUnStampBlockTradeConfirmation(): Promise<
    TradeConfirmationWithDetailDto[]
  > {
    return this.tradebookConfirmationRepository.query(
      getTradeConfirmationWithTradeDetail,
    );
  }

  async updateTradeConfirmationStampBlock(
    tradeId: number,
  ): Promise<TradebookConfirmation> {
    const tradebook = await this.tradebookConfirmationRepository.findOne(
      tradeId,
    );

    if (tradebook === undefined) {
      throw new BadRequestException('tradeConfirmationId not found');
    }

    tradebook.isStampBlock = true;

    return this.tradebookConfirmationRepository.save(tradebook);
  }

  async getMarketSummaryData(
    timeframe = 'hour',
  ): Promise<TradeSessionResponseDto[]> {
    const sessionSqlMap = {
      hour: getMarketDataSummaryHour,
      // day: getSessionSqlDay,
      // month: getSessionSqlMonth,
    };
    const sql = sessionSqlMap[timeframe];

    return this.tradebookRepository.query(sql);
  }

  async getTradeHistoryByAccountNo(accountNo: number): Promise<Tradebook[]> {
    return this.tradebookRepository.find({
      where: {
        incomingAccountNo: accountNo,
      },
    });
  }
}
