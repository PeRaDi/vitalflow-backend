import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../types/transaction-type.enum';
export class StockTransactionDto {
    @ApiProperty()
    stock: number;

    @ApiProperty()
    transactionType: TransactionType;
}
