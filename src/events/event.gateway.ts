import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateOrderbookDto } from 'src/order/dto/create-order.dto';
import { OrderbookService } from 'src/order/order.service';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import * as dayjs from 'dayjs';
import { GetOrderbookDto } from 'src/order/dto/get-order.dto';
import { TradeService } from 'src/trade/trade.service';
@WebSocketGateway(3003, {
  cors: {
    origin: '*',
  },
})
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('EventGateway');

  constructor(
    private orderbookService: OrderbookService,
    private tradebokService: TradeService,
  ) {}

  afterInit(server: any) {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]): any {
    this.logger.log(`connected---${client.id}`);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log(`disconnect---${client.id}`);
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendOrder')
  async sendOrder(
    @MessageBody()
    data: CreateOrderbookDto,
  ) {
    try {
      let quantityTmp = data.quantity;
      const side = data.side === 'buy' ? 'sell' : 'buy';
      const whereSide =
        side === 'buy'
          ? MoreThanOrEqual(data.price)
          : LessThanOrEqual(data.price);
      const startOrderTime = dayjs(data.orderTime)
        .set('minute', 0)
        .set('second', 0)
        .toString();
      const endOrderTime = dayjs(data.orderTime)
        .set('minute', 59)
        .set('second', 59)
        .toString();

      const orderbooks = await this.orderbookService.findOrdersByPrice(
        whereSide,
        side,
        data.accountNo,
        startOrderTime,
        endOrderTime,
      );

      await Promise.all(
        orderbooks.map(async (orderbook) => {
          if (quantityTmp == 0) return;

          const qtyLeft = orderbook.remainingQuantity - quantityTmp;
          const isFullyExecuted = qtyLeft <= 0;

          quantityTmp = isFullyExecuted ? Math.abs(qtyLeft) : 0;

          await this.orderbookService.save({
            ...orderbook,
            remainingQuantity: isFullyExecuted ? 0 : qtyLeft,
            status: isFullyExecuted ? 'fullyExecuted' : 'working',
          });

          const matchedQty =
            orderbook.remainingQuantity - (isFullyExecuted ? 0 : qtyLeft);

          const incomingOrder = await this.orderbookService.create({
            ...data,
            remainingQuantity: quantityTmp,
            status: quantityTmp == 0 ? 'fullyExecuted' : 'working',
          });

          await this.tradebokService.createTrade({
            incomingAccountNo: data.accountNo,
            bookOrderAccountNo: orderbook.accountNo,
            bookOrderId: orderbook.order_id,
            incomingOrderId: incomingOrder.order_id,
            quantity: matchedQty,
            price: orderbook.price,
            tradeTime: incomingOrder.orderTime,
            incomingOrderSide: data.side,
            bookOrderSide: orderbook.side,
            incomingOrderRemainingQuantity: quantityTmp,
            bookOrderRemainingQuantity: isFullyExecuted ? 0 : qtyLeft,
            status: 'Matched',
          });
        }),
      );

      if (orderbooks.length < 1) {
        await this.orderbookService.create({
          ...data,
          remainingQuantity: quantityTmp,
          status: quantityTmp == 0 ? 'fullyExecuted' : 'working',
        });
      }

      const startTime = dayjs().set('minute', 0).set('second', 0).toString();
      const endTime = dayjs().set('minute', 59).set('second', 59).toString();
      const sessions = await this.tradebokService.getSessionTrade();

      await this.getOrderbook({ startTime, endTime });
      this.server.emit('sessions', JSON.stringify(sessions));
    } catch (err) {
      console.log('da: err', err);
      this.server.emit('newOrder', err.message);
    }
  }

  @SubscribeMessage('getOrderbook')
  async getOrderbook(
    @MessageBody()
    data: GetOrderbookDto,
  ) {
    try {
      const orderBooks = await this.orderbookService.findOrderbook(
        new Date(data.startTime),
        new Date(data.endTime),
      );
      console.log('da: orderBooks', orderBooks);
      this.server.emit('orderBooks', JSON.stringify(orderBooks));
    } catch (err) {
      console.log('err.message', err.message);
      this.server.emit('orderBooks', err.message);
    }
  }

  @SubscribeMessage('getSession')
  async getSession(@MessageBody() timeframe: string) {
    try {
      const sessions = await this.tradebokService.getSessionTrade(timeframe);

      this.server.emit('sessions', JSON.stringify(sessions));
    } catch (err) {
      this.server.emit('sessions', err.message);
    }
  }

  @SubscribeMessage('getMarketSummaryData')
  async getMarketSummaryData(@MessageBody() timeframe: string) {
    try {
      const marketSummary = await this.tradebokService.getMarketSummaryData(
        timeframe,
      );

      this.server.emit('marketSummary', JSON.stringify(marketSummary));
    } catch (err) {
      this.server.emit('marketSummary', err.message);
    }
  }
}
