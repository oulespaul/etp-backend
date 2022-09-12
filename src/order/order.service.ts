import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orderbook } from 'src/entities/orderbook.entity';
import { Between, FindOperator, Not, Repository } from 'typeorm';
import { CreateOrderbookDto } from './dto/create-order.dto';

@Injectable()
export class OrderbookService {
  constructor(
    @InjectRepository(Orderbook)
    private orderbookRepository: Repository<Orderbook>,
  ) {}

  async create(createOrderbookDto: CreateOrderbookDto): Promise<Orderbook> {
    const newOrder = this.orderbookRepository.create(createOrderbookDto);

    return this.orderbookRepository.save(newOrder);
  }

  async findOrdersByPrice(
    price: FindOperator<number>,
    side: string,
    accountNo: string,
    startTime: string,
    endTime: string,
  ): Promise<Orderbook[]> {
    return this.orderbookRepository.find({
      where: {
        price,
        side,
        status: 'working',
        accountNo: Not(accountNo),
        remainingQuantity: Not(0),
        orderTime: Between(new Date(startTime), new Date(endTime)),
      },
    });
  }

  async save(updatedOrderbook: Orderbook): Promise<Orderbook> {
    return this.orderbookRepository.save(updatedOrderbook);
  }

  async findOrderbook(startTime: Date, endTime: Date): Promise<Orderbook[]> {
    return this.orderbookRepository
      .createQueryBuilder('ob')
      .select('ob.price', 'price')
      .addSelect('SUM(ob.remaining_quantity)', 'qty')
      .addSelect('ob.side', 'side')
      .where('ob.status = :status', { status: 'working' })
      .andWhere('ob.order_time BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      })
      .groupBy('ob.price')
      .addGroupBy('ob.side')
      .orderBy('ob.side')
      .getRawMany();
  }

  async findOpenOrders(accountNo: string): Promise<Orderbook[]> {
    return this.orderbookRepository.find({
      where: {
        status: 'working',
        accountNo: accountNo,
      },
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Orderbook> {
    const order = await this.orderbookRepository.findOne({
      where: {
        order_id: orderId,
      },
    });

    if (!order) throw new BadRequestException(`Order id: ${orderId} Not found`);

    order.status = status;

    return this.orderbookRepository.save(order);
  }

  async findOrderWorkingByDate(
    orderTime: FindOperator<Date>,
  ): Promise<Orderbook[]> {
    return this.orderbookRepository.find({
      where: {
        status: 'working',
        orderTime: orderTime,
      },
    });
  }
}
