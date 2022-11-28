import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TradebookConfirmation } from 'src/entities/tradebook-confirmation.entity';
import { Tradebook } from 'src/entities/tradebook.entity';
import { FindOperator, Repository } from 'typeorm';
import { ComfirmTradebookDto } from './dto/confirm-trade.dto';
import { CreateTradebookDto } from './dto/create-trade.dto';
import { getSessionSql } from '../helpers/trade/sql/getSession';
import { TradeSessionResponseDto } from './dto/trade-session-response';
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
    const tradeId = Number(confirmTrade.refId.split('TB')[1]);
    const tradebook = await this.getTradeById(tradeId);
    if (tradebook === undefined) {
      throw new BadRequestException('refId not found');
    }

    const tradebookConfirmationExited =
      await this.tradebookConfirmationRepository.find({
        where: [
          {
            tradebookId: tradeId,
          },
        ],
      });

    if (tradebookConfirmationExited.length > 0) {
      throw new BadRequestException(`refId ${tradeId} has already confirmed`);
    }

    const tradebookConfirmation = this.tradebookConfirmationRepository.create({
      orderbookId: Number(confirmTrade.transactionId.split('OB')[1]),
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
  ): Promise<Tradebook[]> {
    return this.tradebookRepository.find({
      where: {
        isTradeRequest: false,
        tradeTime: dateRange,
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

  async getSessionTrade(): Promise<TradeSessionResponseDto[]> {
    return this.tradebookRepository.query(getSessionSql);
  }
}
