import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit-table';
import { formatNumber } from 'src/helpers/numberFormet';
import { TradeService } from 'src/trade/trade.service';

@Injectable()
export class InvoiceService {
  constructor(private tradeService: TradeService) {}

  private readonly logger = new Logger(InvoiceService.name);

  async getInvoiceData(accountNo: number) {
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

    // Sell
    const connectedTransferFee = Number(tradeMonthly.trnUsageSell) * 1.151;
    const totalSell = Number(tradeMonthly.valueSell) + connectedTransferFee;

    // Buy
    const totalBuy = Number(tradeMonthly.valueBuy);

    const total = totalSell + totalBuy;
    const feeThb = Number(total) * 0.07;
    const valueIncludeFee = Number(total) + feeThb;

    const invoice = {
      invoiceDate: today,
      client: {
        number: tradeMonthly.accountNo,
      },
      items: [
        {
          task: 'พลังงานไฟฟ้าที่ขาย',
          quantity: formatNumber(tradeMonthly.trnUsageSell, 2),
          value: formatNumber(tradeMonthly.valueSell, 2),
        },
        {
          task: 'ค่าเชื่อมระบบสายส่ง',
          quantity: formatNumber(tradeMonthly.trnUsageSell, 2),
          value: formatNumber(connectedTransferFee, 2), // 1.151/unit
        },
        {
          task: 'รวมจำนวนเงิน',
          quantity: ' ',
          value: formatNumber(totalSell, 2),
        },
        {
          task: 'พลังงานไฟฟ้าที่ซื้อ',
          quantity: formatNumber(tradeMonthly.trnUsageBuy, 2),
          value: formatNumber(tradeMonthly.valueBuy, 2),
        },
        {
          task: 'รวมจำนวนเงิน',
          quantity: ' ',
          value: formatNumber(totalBuy, 2),
        },
        {
          task: 'พลังงานไฟฟ้าที่ใช้จากการไฟฟ้า',
          quantity: ' ',
          value: formatNumber(0, 2),
        },
        {
          task: 'ค่าบริการ',
          quantity: ' ',
          value: formatNumber(0, 2), // 24.62 / unit
        },
        {
          task: 'ค่า FT',
          quantity: ' ',
          value: formatNumber(0, 2), // .91 / unit
        },
        {
          task: 'รวมจำนวนเงิน',
          quantity: ' ',
          value: formatNumber(0, 2),
        },
        {
          task: 'รวมค่าพลังงานไฟฟ้าสุทธิ',
          value: formatNumber(total),
        },
        {
          task: 'ภาษีมูลค่าเพิ่ม 7%',
          value: formatNumber(feeThb),
        },
        {
          task: 'รวมเงินที่ต้องชำระ',
          value: formatNumber(valueIncludeFee),
        },
      ],
      histories: [
        {
          month: '',
          value1: formatNumber(0, 2),
          value2: formatNumber(0, 2),
          value3: formatNumber(0, 2),
          value4: formatNumber(0, 2),
          value5: formatNumber(0, 2),
          value6: formatNumber(0, 2),
        },
      ],
    };

    return invoice;
  }

  async createInvoice(invoice): Promise<Buffer> {
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      this.generateCustomerInformation(doc, invoice);
      this.generateInvoiceTable(doc, invoice);
      // this.generateHistoryTable(doc, invoice);

      doc.end();

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
    });

    return pdfBuffer;
  }

  generateCustomerInformation(doc, invoice) {
    doc
      .fillColor('#444444')
      .fontSize(20)
      .font('fonts/THSarabunNew.ttf')
      .text('หนังสือแจ้งค่าไฟฟ้า', 240, 50);

    this.generateHr(doc, 90);

    const customerInformationTop = 100;

    doc
      .fontSize(14)
      .font('fonts/THSarabunNew.ttf')
      .text(invoice.invoiceDate, 400, customerInformationTop + 10)
      .text(
        `ค่าไฟฟ้าประจำเดือน: ${invoice.invoiceDate.split(' ')[2]}`,
        50,
        customerInformationTop + 40,
      )
      .text(
        `หมายเลขผู้ใช้ไฟฟ้า: ${invoice.client.number}`,
        50,
        customerInformationTop + 60,
      );

    this.generateHr(doc, customerInformationTop + 100);
  }

  generateInvoiceTable(doc, invoice) {
    const table = {
      title: {
        label: 'รายละเอียดการใช้ไฟ',
        property: 'history',
        width: 70,
      },
      headers: [
        { label: 'รายการ', property: 'task', width: 200, align: 'center' },
        {
          label: 'จำนวนที่ใช้ (หน่วย : kWh)',
          property: 'quantity',
          width: 150,
          align: 'center',
        },
        {
          label: 'จำนวนเงิน (บาท)',
          property: 'value',
          width: 150,
          align: 'center',
        },
      ],
      datas: invoice.items,
    };

    doc.table(table, {
      y: 250,
      prepareHeader: () => doc.font('fonts/THSarabunNew-Bold.ttf').fontSize(12),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('fonts/THSarabunNew.ttf').fontSize(10);
      },
    });
  }

  generateHistoryTable(doc, invoice) {
    const historyTableTop = 480;
    this.generateHr(doc, historyTableTop);

    const table = {
      title: {
        label: 'ประวัติการใช้ไฟฟ้า',
        property: 'history',
        width: 70,
        align: 'center',
      },
      headers: [
        { label: 'เดือน', property: 'month', width: 70, align: 'center' },
        { label: 'มิ.ย.', property: 'amount1', width: 70, align: 'center' },
        { label: 'ส.ค.', property: 'amount2', width: 70, align: 'center' },
        { label: 'ก.ย.', property: 'amount3', width: 70, align: 'center' },
        { label: 'ต.ค.', property: 'amount4', width: 70, align: 'center' },
        { label: 'พ.ย.', property: 'amount5', width: 70, align: 'center' },
        { label: 'ธ.ค.', property: 'amount6', width: 70, align: 'center' },
      ],
      datas: invoice.histories,
    };

    doc.table(table, {
      y: 510,
      width: 500,
      prepareHeader: () => doc.font('fonts/THSarabunNew-Bold.ttf').fontSize(12),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('fonts/THSarabunNew.ttf').fontSize(10);
      },
    });
  }

  generateHr(doc, y) {
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
}
