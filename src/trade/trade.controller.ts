import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  Response,
  Param,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { Tradebook } from 'src/entities/tradebook.entity';
import { InvoiceService } from 'src/services/invoice.service';
import { ComfirmTradebookDto } from './dto/confirm-trade.dto';
import { TradeService } from './trade.service';
import { Response as Res } from 'express';
import { CreateTradebookDto } from './dto/create-trade.dto';

@Controller('/api/trade')
@ApiTags('tradebook')
export class TradeController {
  constructor(
    private tradeService: TradeService,
    private invoiceService: InvoiceService,
  ) {}

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

  @Get('/invoice/:accountNo')
  async getInvoice(@Param('accountNo') accountNo: number) {
    return this.invoiceService.getInvoiceData(accountNo);
  }

  @Get('/invoice/download/:accountNo')
  async downloadInvoice(
    @Param('accountNo') accountNo: number,
    @Response() res: Res,
  ) {
    const invoiceData = await this.invoiceService.getInvoiceData(accountNo);

    const buffer = await this.invoiceService.createInvoice(invoiceData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // For global send trade manually
  @Post()
  createTradebook(@Body() createTradebookDto: CreateTradebookDto) {
    return this.tradeService.createTrade(createTradebookDto);
  }

  @Get('/:accountNo')
  async getTradeHistory(@Param('accountNo') accountNo: number) {
    return this.tradeService.getTradeHistoryByAccountNo(accountNo);
  }
}
