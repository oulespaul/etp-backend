import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
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

  @UseGuards(ApiKeyAuthGuard)
  @Post('/confirm')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'COMPLETE',
        timestamp: '2022-10-17T02:02:13.874Z',
      },
    },
  })
  @HttpCode(200)
  async confirm(
    @Body() confirmDto: ComfirmTradebookDto,
  ): Promise<{ status: string; timestamp: Date }> {
    if (!confirmDto.transactionId.startsWith('OB')) {
      throw new BadRequestException('transactionId must be start with OB');
    }
    if (!confirmDto.refId.startsWith('TB')) {
      throw new BadRequestException('transactionId must be start with TB');
    }
    return this.tradeService.createTradeConfirmation(confirmDto);
  }
}
