import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ConfirmTradeStatus } from '../confirm-trade.enum';

export class ComfirmTradebookDto {
  @ApiProperty({
    type: String,
    description: 'Match Id: This is a required property',
    example: 'OB1',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    type: String,
    description: 'Uniq Id for reference: This is a required property',
    example: 'TB1',
  })
  @IsString()
  refId: string;

  @ApiProperty({
    type: String,
    description:
      'Status can be "COMPLETE", "FAILED": This is a required property',
    example: 'COMPLETE',
  })
  @IsEnum(ConfirmTradeStatus)
  status: string;

  @ApiProperty({
    type: Number,
    description: 'Rated usage for the transaction: This is a required property',
    example: 100,
  })
  @IsNumber()
  trnUsage: number;

  @ApiProperty({
    type: Number,
    description:
      'Revenue(+) or Payment(-) including Income/Expense, Fine, Wheeling, Service: This is a required property',
    example: 60.77,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    type: Number,
    description:
      'epoch time of transaction record: This is a required property',
    example: 1662393637,
  })
  @IsNumber()
  timestamp: number;
}
