import { Orderbook } from 'src/entities/orderbook.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export class GlobalOrderRequestDto {
  orderId: number;
  side: string;
  orderType: string;
  accountNo: string;
  price: number;
  quantity: number;
  site: string;
  orderTime: Date;
  remainingQuantity: number;
  status: string;

  static toModel(order: Orderbook): GlobalOrderRequestDto {
    const globalOrder = new GlobalOrderRequestDto();

    globalOrder.orderId = order.order_id;
    globalOrder.side = order.side;
    globalOrder.orderType = order.orderType;
    globalOrder.accountNo = order.accountNo;
    globalOrder.price = order.price;
    globalOrder.quantity = order.quantity;
    globalOrder.site = process.env.SITE;
    globalOrder.orderTime = order.orderTime;
    globalOrder.remainingQuantity = order.remainingQuantity;
    globalOrder.status = order.status;

    return globalOrder;
  }
}
