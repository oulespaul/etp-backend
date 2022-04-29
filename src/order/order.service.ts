import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orderbook } from 'src/entities/orderbook.entity';
import { Not, Repository } from 'typeorm';
import { CreateOrderbookDto } from './dto/create-order.dto';

@Injectable()
export class OrderbookService {
  constructor(
    @InjectRepository(Orderbook)
    private orderbookRepository: Repository<Orderbook>,
  ) {}

  create(createOrderbookDto: CreateOrderbookDto) {
    const newOrder = this.orderbookRepository.create(createOrderbookDto);

    return this.orderbookRepository.save(newOrder);
  }

  findOrdersByPrice(price: number, side: string, accountNo: string) {
    return this.orderbookRepository.find({
      where: {
        price,
        side,
        status: 'working',
        accountNo: Not(accountNo),
        remainingQuantity: Not(0),
      },
    });
  }

  save(updatedOrderbook: Orderbook) {
    return this.orderbookRepository.save(updatedOrderbook);
  }

  findOrderbook(): Promise<Orderbook[]> {
    return this.orderbookRepository
      .createQueryBuilder('ob')
      .select('ob.price', 'price')
      .addSelect('SUM(ob.remaining_quantity)', 'qty')
      .addSelect('ob.side', 'side')
      .where('ob.status = :status', { status: 'working' })
      .groupBy('ob.price')
      .addGroupBy('ob.side')
      .orderBy('ob.side')
      .getRawMany();
  }
}
