import { Tradebook } from 'src/entities/tradebook.entity';
import { MAKER_TAKER } from 'src/constants/maker-taker.enum';
import * as dayjs from 'dayjs';

export class TradeRequestDto {
  clientId: number;
  transactionDateTime: string;
  tradeType: number;
  transactionId: string;
  refId: string;
  duration: number;
  volume: number;
  unitPrice: number;

  static toModel(tradebook: Tradebook, makerTaker: MAKER_TAKER) {
    const model = new TradeRequestDto();
    const isMaker = makerTaker === MAKER_TAKER.MAKER;

    const clientId = isMaker
      ? tradebook.bookOrderAccountNo
      : tradebook.incomingAccountNo;
    const side = isMaker
      ? tradebook.bookOrderSide
      : tradebook.incomingOrderSide;
    const orderId = isMaker ? tradebook.bookOrderId : tradebook.incomingOrderId;
    const tradeTime = dayjs(tradebook.tradeTime)
      .add(1, 'hour')
      .format('YYYYMMDDHH0000');

    model.clientId = parseInt(clientId);
    model.transactionDateTime = tradeTime;
    model.tradeType = side === 'buy' ? 10 : 20;
    model.transactionId = `OB${orderId}`;
    model.refId = `TB${tradebook.tradeId}|OB${orderId}`;
    model.duration = 60;
    model.volume = parseFloat(tradebook.quantity.toString());
    model.unitPrice = parseFloat(tradebook.price.toString());

    return model;
  }
}
