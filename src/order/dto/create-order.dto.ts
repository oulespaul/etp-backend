import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderbookDto {
  @IsString()
  @IsNotEmpty()
  side: string;

  @IsString()
  @IsNotEmpty()
  orderType: string;

  @IsString()
  accountNo: string;

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

  @IsOptional()
  orderTime?: Date;
}
