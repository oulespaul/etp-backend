export class TradeRequestDto {
  clientId: number;
  transactionDateTime: string;
  tradeType: number;
  transactionId: string;
  refId: string;
  duration: number;
  volume: number;
  unitPrice: number;
}
