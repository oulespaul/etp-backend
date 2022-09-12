import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderbookService } from 'src/order/order.service';
import * as dayjs from 'dayjs';
import { LessThan } from 'typeorm';

@Injectable()
export class ClearingOrderTaskService {
  constructor(private orderService: OrderbookService) {}

  private readonly logger = new Logger(ClearingOrderTaskService.name);

  @Cron('0 * * * * *')
  async handleCron() {
    const curHour = dayjs().set('minute', 0).set('second', 0).toString();

    this.logger.debug(`Starting clearing order with date: ${curHour}`);

    const orders = await this.orderService.findOrderWorkingByDate(
      LessThan(new Date(curHour)),
    );

    if (orders.length === 0) {
      return this.logger.debug(`Orders is empty`);
    }

    await Promise.all(
      orders.map((order) =>
        this.orderService.updateOrderStatus(
          order.order_id.toString(),
          'canceled',
        ),
      ),
    );

    this.logger.debug(`Cleared ${orders.length} order`);
  }
}
