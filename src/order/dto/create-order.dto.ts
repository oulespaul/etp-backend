import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderbookDto {
  @IsString()
  @IsNotEmpty()
  side: string;

  @IsString()
  @IsNotEmpty()
  orderType: string;

  @IsNumber()
  accountNo: number;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  remainingQuantity?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
