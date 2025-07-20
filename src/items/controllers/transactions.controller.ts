import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Query,
    Req,
    Res,
} from '@nestjs/common';
import { ItemsService } from 'src/items/services/items.service';
import BenignErrorResponse from 'src/responses/benign-error-response';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { StockTransactionDto } from '../dto/stock-transaction.dto';
import { TransactionsService } from '../services/transactions.service';
import { TransactionType } from '../types/transaction-type.enum';

@Controller('items/transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly itemsService: ItemsService,
    ) {}

    //#region GET
    @Get('overview')
    @Roles('user')
    async getOverview(@Req() req, @Res() res) {
        try {
            const user = req.user;

            const itemsOverview = await this.transactionsService.getOverview(
                user.tenant.id,
            );

            return new Response(
                res,
                'Stocked items overview retrieved successfully.',
                HttpStatus.OK,
                itemsOverview,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving items overview.',
                error,
            ).toThrowException();
        }
    }

    @Get(':item_id/stats')
    @Roles('user')
    async getStats(@Req() req, @Res() res, @Param('item_id') item_id: string) {
        try {
            const itemId = Number(item_id);
            const user = req.user;

            const item = await this.itemsService.findOne(itemId);
            if (!item || item.tenantId !== user.tenant.id) {
                return new BenignErrorResponse(
                    res,
                    'Item not found.',
                    HttpStatus.NOT_FOUND,
                ).toHttpResponse();
            }

            const stats = await this.transactionsService.getConsumptionStats(
                item.id,
            );

            return new Response(
                res,
                'Item statistics retrieved successfully.',
                HttpStatus.OK,
                stats,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving item statistics.',
                error,
            ).toThrowException();
        }
    }

    @Get(':item_id/history')
    @Roles('user')
    async getHistory(
        @Req() req,
        @Res() res,
        @Param('item_id') item_id: string,
        @Query('limit') limit?: string,
    ) {
        try {
            const itemId = Number(item_id);
            const user = req.user;

            const item = await this.itemsService.findOne(itemId);
            if (!item || item.tenantId !== user.tenant.id) {
                return new BenignErrorResponse(
                    res,
                    'Item not found.',
                    HttpStatus.NOT_FOUND,
                ).toHttpResponse();
            }

            const history = await this.transactionsService.getHistory(
                item.id,
                limit ? Number(limit) : undefined,
            );

            return new Response(
                res,
                'Item transaction history retrieved successfully.',
                HttpStatus.OK,
                history,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving item transaction history.',
                error,
            ).toThrowException();
        }
    }

    @Get(':item_id/user-logs')
    @Roles('user')
    async getUserLogs(
        @Req() req,
        @Res() res,
        @Param('item_id') item_id: string,
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string,
    ) {
        try {
            const itemId = Number(item_id);
            const user = req.user;

            const item = await this.itemsService.findOne(itemId);
            if (!item || item.tenantId !== user.tenant.id) {
                return new BenignErrorResponse(
                    res,
                    'Item not found.',
                    HttpStatus.NOT_FOUND,
                ).toHttpResponse();
            }

            const userLogs = await this.transactionsService.getUserLogs(
                item.id,
                Number(limit),
                cursor,
            );

            return new Response(
                res,
                'User logs retrieved successfully.',
                HttpStatus.OK,
                userLogs,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving user logs.',
                error,
            ).toThrowException();
        }
    }

    //#endregion

    //#region POST
    // @Post(':item_id/train')
    // @Roles('user')
    // async train(@Req() req, @Res() res, @Param('item_id') item_id: string) {
    //     try {
    //         const itemId = Number(item_id);
    //         const result = await this.transactionsService.train(itemId);

    //         return new Response(
    //             res,
    //             'Training successfully initiated.',
    //             HttpStatus.OK,
    //             { jobId: result },
    //         ).toHttpResponse();
    //     } catch (error) {
    //         return new ErrorResponse(
    //             'An error occurred while initiating training.',
    //             error,
    //         ).toThrowException();
    //     }
    // }

    //#endregion

    //#region PUT

    //#endregion

    //#region PATCH
    @Patch(':item_id')
    @Roles('user')
    async createTransaction(
        @Req() req,
        @Res() res,
        @Param('item_id') itemId: number,
        @Body() stockTransactionDto: StockTransactionDto,
    ) {
        try {
            console.log('Creating transaction:', {
                itemId,
                stockTransactionDto,
            });
            const user = req.user;
            const stock = stockTransactionDto.quantity;

            const item = await this.itemsService.findOne(Number(itemId));
            if (!item || item.tenantId !== user.tenant.id) {
                return new BenignErrorResponse(
                    res,
                    'Item not found.',
                    HttpStatus.NOT_FOUND,
                ).toHttpResponse();
            }

            const transactionType: TransactionType =
                stockTransactionDto.transactionType === 1
                    ? TransactionType.IN
                    : stockTransactionDto.transactionType === 2
                      ? TransactionType.OUT
                      : null;

            if (!transactionType) {
                return new ErrorResponse(
                    'Invalid transaction type.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();
            }

            const currentStock = await this.transactionsService.getCurrentStock(
                item.id,
            );

            if (
                transactionType === TransactionType.OUT &&
                stock > currentStock
            ) {
                return new ErrorResponse(
                    'Insufficient stock for this transaction.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();
            }

            const status = await this.transactionsService.createTransaction(
                user.id,
                item.id,
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
