export class TradeConfirmationWithDetailDto {
  tradeConfirmationId: number;
  userId: string;
  transactionId: number;
  refId: number;
  status: string;
  trnUsage: number;
  tradeTotal: number;
  timestamp: Date;
}
