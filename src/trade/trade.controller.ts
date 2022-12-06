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
import { formatNumber } from 'src/helpers/numberFormet';

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
  async getInvoice(
    @Param('accountNo') accountNo: number,
    @Response() res: Res,
  ) {
    const tradeMonthly = await this.tradeService.getMonthlyTradeConfirmation(
      accountNo,
    );
    if (!tradeMonthly) {
      throw new BadRequestException('Not found any trade confirmation');
    }

    const today = new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'full',
      timeZone: 'Asia/Bangkok',
    }).format(new Date());

    const invoice = {
      invoiceDate: today,
      client: {
        number: tradeMonthly.accountNo,
      },
      items: [
        {
          task: 'พลัังงานไฟฟ้าใช้งาน (หน่วย)',
          quantity: formatNumber(tradeMonthly.trnUsage, 2),
          amount: formatNumber(tradeMonthly.price, 2),
        },
        {
          task: 'พลังงานไฟฟ้าจ่ายออก (หน่วย)',
          quantity: formatNumber(tradeMonthly.trnUsage, 2),
          amount: formatNumber(tradeMonthly.price, 2),
        },
        {
          task: 'พลังงานไฟฟ้าสุทธิ (หน่วย)',
          quantity: formatNumber(tradeMonthly.trnUsage, 2),
          amount: formatNumber(tradeMonthly.price, 2),
        },
        {
          task: 'ค่าบริการ (บาท)',
          amount: formatNumber(100, 2),
        },
        {
          task: 'รวมค่าไฟฟ้า (บาท)',
          amount: formatNumber(tradeMonthly.price),
        },
        {
          task: 'ภาษีมูลค่าเพิ่ม 7%',
          amount: formatNumber(tradeMonthly.price * 0.07),
        },
        {
          task: 'รวมเงินที่ต้องชำระ (บาท)',
          amount: formatNumber(
            Number(tradeMonthly.price) + tradeMonthly.price * 0.07 + 100,
          ),
        },
      ],
      histories: [
        {
          month: '',
          amount1: formatNumber(0, 2),
          amount2: formatNumber(0, 2),
          amount3: formatNumber(0, 2),
          amount4: formatNumber(0, 2),
          amount5: formatNumber(0, 2),
          amount6: formatNumber(0, 2),
        },
      ],
    };

    const buffer = await this.invoiceService.createInvoice(invoice);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
