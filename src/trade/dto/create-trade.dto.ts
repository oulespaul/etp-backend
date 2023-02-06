export class CreateTradebookDto {
  incomingAccountNo: string;
  bookOrderAccountNo: string;
  bookOrderId: number;
  incomingOrderId: number;
  quantity: number;
  price: number;
  tradeTime: Date;
  incomingOrderSide: string;
  bookOrderSide: string;
  incomingOrderRemainingQuantity: number;
  bookOrderRemainingQuantity: number;
  status?: string;
}
