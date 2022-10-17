import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TradebookConfirmation } from 'src/entities/tradebook-confirmation.entity';
import { Tradebook } from 'src/entities/tradebook.entity';
import { Repository } from 'typeorm';
import { ComfirmTradebookDto } from './dto/confirm-trade.dto';
import { CreateTradebookDto } from './dto/create-trade.dto';

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
    const tradebook = this.tradebookRepository.create(createTrade);

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
      timestamp: new Date(confirmTrade.timestamp),
    });

    const tradeConfirmed = await this.tradebookConfirmationRepository.save(
      tradebookConfirmation,
    );

    return {
      status: tradeConfirmed.status,
      timestamp: tradeConfirmed.timestamp,
    };
  }
}
