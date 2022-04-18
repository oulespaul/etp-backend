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

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('EventGateway');

  constructor(private orderbookService: OrderbookService) {}

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
      const orderbooks = await this.orderbookService.findOrdersByPrice(
        data.price,
        side,
        data.accountNo,
      );

      orderbooks.forEach(async (orderbook) => {
        if (quantityTmp == 0) return;

        const qtyLeft = orderbook.remainingQuantity - quantityTmp;
        const isFullyExecuted = qtyLeft <= 0;

        quantityTmp = isFullyExecuted ? Math.abs(qtyLeft) : 0;

        await this.orderbookService.save({
          ...orderbook,
          remainingQuantity: isFullyExecuted ? 0 : qtyLeft,
          status: isFullyExecuted ? 'fullyExecuted' : 'working',
        });
      });

      await this.orderbookService.create({
        ...data,
        remainingQuantity: quantityTmp,
        status: quantityTmp == 0 ? 'fullyExecuted' : 'working',
      });

      this.getOrderbook();
    } catch (err) {
      this.server.emit('newOrder', err.message);
    }
  }

  @SubscribeMessage('getOrderbook')
  async getOrderbook() {
    try {
      const orderBooks = await this.orderbookService.findOrderbook();

      this.server.emit('orderBooks', JSON.stringify(orderBooks));
    } catch (err) {
      this.server.emit('orderBooks', err.message);
    }
  }
}
