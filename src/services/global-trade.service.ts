import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GlobalOrderRequestDto } from 'src/trade/dto/global-order-request.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GlobalTradeService {
  constructor(private readonly httpService: HttpService) {}

  private readonly logger = new Logger(GlobalTradeService.name);

  async orderRequest(reqBody: GlobalOrderRequestDto[]): Promise<any> {
    this.logger.debug(`Order request to global trade total: ${reqBody.length}`);
    const globalHost = process.env.GLOBAL_HOST;

    try {
      return this.httpService
        .post(`${globalHost}/orders`, reqBody, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .toPromise();
    } catch (error) {
      this.logger.error(`Order request error: ${error}`);
      return null;
    }
  }
}
