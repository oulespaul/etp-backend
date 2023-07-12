import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderbookService } from 'src/order/order.service';
import * as dayjs from 'dayjs';
import { LessThan } from 'typeorm';
import { GlobalOrderRequestDto } from 'src/trade/dto/global-order-request.dto';
import { GlobalTradeService } from './global-trade.service';

@Injectable()
export class ClearingOrderTaskService {
  constructor(
    private orderService: OrderbookService,
    private globalTradeService: GlobalTradeService,
  ) {}

  private readonly logger = new Logger(ClearingOrderTaskService.name);

  @Cron('0 56 * * * *') // At second :00 of minute :56 of every hour
  async handleGlobalTradeCron() {
    const curHour = dayjs().set('minute', 55).set('second', 0).toString();

    this.logger.debug(`Starting send order to global trade`);

    const orders = await this.orderService.findOrderWorkingByDate(
      LessThan(new Date(curHour)),
    );

    if (orders.length === 0) {
      return this.logger.debug(`Orders is empty`);
    }

    const orderGlobalTradeRequests = orders.map((order) =>
      GlobalOrderRequestDto.toModel(order),
    );

    await this.globalTradeService.orderRequest(orderGlobalTradeRequests);

    this.logger.debug(`Cleared ${orders.length} order`);
  }

  @Cron('0 55 * * * *') // At second :00 of minute :55 of every hour
  async handleClearOrderCron() {
    const curHour = dayjs()
      .subtract(1, 'hour')
      .set('minute', 59)
      .set('second', 59)
      .toString();

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
