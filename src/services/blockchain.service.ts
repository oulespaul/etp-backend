import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { StampBlockchainDto } from 'src/trade/dto/stamp-blockchain.dto';

@Injectable()
export class BlockchainService {
  constructor(private readonly httpService: HttpService) {}

  private readonly logger = new Logger(BlockchainService.name);

  async stampToBlockchain(reqBody: StampBlockchainDto): Promise<any> {
    this.logger.debug(`Stamp To Blockchain with ${JSON.stringify(reqBody)}`);
    return this.httpService
      .post('http://103.212.36.37:8080/api/createTradingTransaction', reqBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .toPromise();
  }
}
