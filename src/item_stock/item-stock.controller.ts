import {
    Body,
    Controller,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { StockTransactionDto } from './dto/stock-transaction.dto';
import { ItemStockService } from './item.stock.service';

@Controller('item-stock')
export class ItemStockController {
    constructor(private readonly itemStockService: ItemStockService) {}

    //#region GET

    //#endregion

    //#region POST
    @Post(':item_id/train')
    @Roles('user')
    async train(@Req() req, @Res() res, @Param('item_id') item_id: string) {
        try {
            const itemId = Number(item_id);
            const result = await this.itemStockService.train(itemId);

            return new Response(
                res,
                'Training successfully initiated.',
                HttpStatus.OK,
                { jobId: result },
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while initiating training.',
                error,
            ).toThrowException();
        }
    }

    //#endregion

    //#region PUT

    //#endregion

    //#region PATCH
    @Patch(':item_id/transaction')
    @Roles('user')
    async createTransaction(
        @Req() req,
        @Res() res,
        @Param('item_id') itemId: string,
        @Body() stockTransactionDto: StockTransactionDto,
    ) {
        try {
            // const user = req.user;
            const stock = stockTransactionDto.stock;
            const transactionType = stockTransactionDto.transactionType;

            const status = await this.itemStockService.createTransaction(
                itemId,
                stock,
                transactionType,
            );

            if (!status) {
                throw new Error('Transaction failed');
            }

            return new Response(
                res,
                'Stock transaction successfully processed.',
                HttpStatus.OK,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while updating item stock.',
                error,
            ).toThrowException();
        }
    }
    //#endregion
}
