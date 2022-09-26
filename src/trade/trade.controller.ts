import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TradebookConfirmation } from 'src/entities/tradebook-confirmation.entity';
import { Tradebook } from 'src/entities/tradebook.entity';
import { ComfirmTradebookDto } from './dto/confirm-trade.dto';
import { TradeService } from './trade.service';

@Controller('/api/trade')
@ApiTags('tradebook')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @Get('/all')
  async getAllTrade(): Promise<Tradebook[]> {
    return this.tradeService.getAllTrade();
  }

  @Post('/confirm')
  async confirm(
    @Body() confirmDto: ComfirmTradebookDto,
  ): Promise<TradebookConfirmation> {
    return this.tradeService.createTradeConfirmation(confirmDto);
  }
}
