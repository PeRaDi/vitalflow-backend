import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { ItemsService } from 'src/items/items.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { TransactionType } from './types/transaction-type.enum';

@Injectable()
export class ItemStockService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly itemsService: ItemsService,
        private readonly rabbitMqService: RabbitMQService,
    ) {}

    async createTransaction(
        itemId: string,
        stock: number,
        transactionType: TransactionType,
    ): Promise<boolean> {
        const item = await this.itemsService.findOne(Number(itemId));
        if (!item) {
            throw new Error('Item not found.');
        }

        await this.databaseService.query(
            'INSERT INTO item_stock (item_id, stock, transaction_type, item_measure_unit_id) VALUES ($1, $2, $3, 8)',
            [itemId, stock, transactionType],
        );

        return true;
    }

    async train(itemId: number): Promise<string> {
        const item = await this.itemsService.findOne(itemId);
        if (!item) {
            throw new Error('Item not found.');
        }

        const jobId = await this.rabbitMqService.insertTrainTask(itemId);
        return jobId;
    }
}
