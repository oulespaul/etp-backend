import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './events/event.module';
import { OrderbookModule } from './order/order.module';
@Module({
  imports: [TypeOrmModule.forRoot(), EventModule, OrderbookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
