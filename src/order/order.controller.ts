import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Orderbook } from 'src/entities/orderbook.entity';
import { OrderbookService } from './order.service';

@Controller('/api/order')
@ApiTags('orderbook')
export class OrderBookController {
  constructor(private readonly orderService: OrderbookService) {}

  @Get('/:accountNo')
  getOpenOrders(@Param('accountNo') accountNo: string): Promise<Orderbook[]> {
    return this.orderService.findOpenOrders(accountNo);
  }

  @Patch('/:orderId')
  @ApiExcludeEndpoint()
  cancelOrder(@Param('orderId') orderId: string): Promise<Orderbook> {
    return this.orderService.updateOrderStatus(orderId, 'canceled');
  }
}
