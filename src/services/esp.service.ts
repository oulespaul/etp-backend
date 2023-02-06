import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TradeRequestDto } from 'src/trade/dto/trade-request.dto';

@Injectable()
export class ESPService {
  constructor(private readonly httpService: HttpService) {}

  private readonly logger = new Logger(ESPService.name);

  async tradeRequest(reqBody: TradeRequestDto): Promise<any> {
    this.logger.debug(`Trade request with ${JSON.stringify(reqBody)}`);
    try {
      return this.httpService
        .post(
          'http://esp-pv.com/BcgWebApi/api/TradeRequest?id=10051001',
          JSON.stringify(reqBody),
          {
            headers: {
              'Content-Type': 'application/json',
              ApiKey: '4iEJxzq0zirF7yvhtT2xjt',
            },
          },
        )
        .toPromise();
    } catch (error) {
      this.logger.error(`Trade request error: ${error}`);
      return null;
    }
  }
}
