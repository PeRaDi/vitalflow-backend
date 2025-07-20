import { ApiProperty } from '@nestjs/swagger';
export class StockTransactionDto {
    @ApiProperty()
    quantity: number;

    @ApiProperty()
    transactionType: number;
}
