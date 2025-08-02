import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { ItemsService } from 'src/items/services/items.service';
import { Job } from 'src/rabbitmq/interfaces/job.interface';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { UsersService } from 'src/users/users.service';
import { ItemConsumption } from '../interfaces/item-consumption.interface';
import { PaginatedUserLogs } from '../interfaces/paginated-user-logs.interface';
import { StockedItemOverview } from '../interfaces/stocked-item-overview.interface';
import { TransactionType } from '../types/transaction-type.enum';

@Injectable()
export class TransactionsService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly itemsService: ItemsService,
        private readonly rabbitMQService: RabbitMQService,
        private readonly userService: UsersService,
    ) {}

    async getCurrentStock(itemId: number): Promise<number> {
        const result = await this.databaseService.query(
            `SELECT
                COALESCE(SUM(CASE WHEN transaction_type_id = 1 THEN quantity ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN transaction_type_id = 2 THEN quantity ELSE 0 END), 0) AS current_stock
                FROM stock_transactions
            WHERE item_id = $1;`,
            [itemId],
        );
        return result.length > 0 ? Number(result[0].current_stock) : 0;
    }

    async getOverview(tenantId: number): Promise<StockedItemOverview[]> {
        const items = await this.itemsService.findAll(tenantId);
        if (!items.length) return [];

        const itemIds = items.map((item) => item.id);
        const stocks = await this.databaseService.query(
            `SELECT
                item_id,
                COALESCE(SUM(CASE WHEN transaction_type_id = 1 THEN quantity ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN transaction_type_id = 2 THEN quantity ELSE 0 END), 0) AS current_stock
            FROM stock_transactions
            WHERE item_id = ANY($1::int[])
            GROUP BY item_id;`,
            [itemIds],
        );

        const stockMap = new Map<number, number>(
            stocks.map((row) => [row.item_id, Number(row.current_stock)]),
        );

        return items.map((item) => ({
            itemId: item.id,
            name: item.name,
            description: item.description,
            active: item.active,
            currentStock: stockMap.get(item.id) || 0,
        }));
    }

    async getConsumptionStats(itemId: number): Promise<any> {
        const result = await this.databaseService.query(
            `WITH consumption AS (
                SELECT
                    quantity,
                    created_at::date AS day
                FROM stock_transactions
                WHERE item_id = $1
                    AND transaction_type_id = 2 -- consumption
                ),
                total AS (
                SELECT SUM(quantity) AS total_consumption FROM consumption
                ),
                today AS (
                SELECT SUM(quantity) AS todays_consumption
                FROM consumption
                WHERE day = CURRENT_DATE
                ),
                days_with_consumption AS (
                SELECT COUNT(DISTINCT day) AS days
                FROM consumption
                )
                SELECT
                total.total_consumption,
                today.todays_consumption,
                ROUND(
                    COALESCE(total.total_consumption::numeric / NULLIF(days_with_consumption.days, 0), 0),
                    2
                ) AS daily_average_consumption
            FROM total, today, days_with_consumption;`,
            [itemId],
        );

        const currentStock = await this.getCurrentStock(itemId);

        if (result.length === 0) {
            return {
                total: 0,
                today: 0,
                dailyAverage: 0,
                current: 0,
            };
        }

        const stats = result[0];
        return {
            total: Number(stats.total_consumption) || 0,
            today: Number(stats.todays_consumption) || 0,
            dailyAverage: Number(stats.daily_average_consumption) || 0,
            current: currentStock,
        };
    }

    async getHistory(
        itemId: number,
        limit?: number,
    ): Promise<ItemConsumption[]> {
        const result = await this.databaseService.query(
            `SELECT
                created_at::date AS date,
                SUM(quantity) AS quantity
            FROM stock_transactions
            WHERE item_id = $1
                AND transaction_type_id = 2
            GROUP BY date
            ORDER BY date DESC
            ${limit ? 'LIMIT $2' : ''};`,
            limit ? [itemId, limit] : [itemId],
        );

        return result.map((row) => ({
            date: new Date(row.date),
            quantity: Number(row.quantity),
        }));
    }

    async getTimeframeHistory(
        itemId: number,
        startDate: Date,
        endDate: Date,
    ): Promise<ItemConsumption[]> {
        const result = await this.databaseService.query(
            `SELECT
                created_at::date AS date,
                SUM(quantity) AS quantity
            FROM stock_transactions
            WHERE item_id = $1
                AND transaction_type_id = 2
                AND created_at >= $2
                AND created_at <= $3
            GROUP BY date
            ORDER BY date DESC;`,
            [itemId, startDate, endDate],
        );

        return result.map((row) => ({
            date: new Date(row.date),
            quantity: Number(row.quantity),
        }));
    }

    async getUserLogs(
        itemId: number,
        limit: number = 20,
        cursor?: string,
    ): Promise<PaginatedUserLogs> {
        let query = `SELECT
                user_id,
                transaction_type_id AS "transactionType",
                quantity,
                created_at AS date
            FROM stock_transactions
            WHERE item_id = $1`;

        const params: any[] = [itemId];

        if (cursor) {
            query += ` AND created_at < $${params.length + 1}`;
            params.push(cursor);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit + 1);

        const result = await this.databaseService.query(query, params);

        const hasNext = result.length > limit;
        const data = hasNext ? result.slice(0, limit) : result;
        const nextCursor =
            hasNext && data.length > 0
                ? data[data.length - 1].date.toISOString()
                : undefined;

        const transformedData = await Promise.all(
            data.map(async (row) => ({
                userId: row.user_id,
                username: (await this.userService.findOne(row.user_id)).name,
                transactionType:
                    row.transactionType === 1
                        ? ('IN' as const)
                        : ('OUT' as const),
                quantity: Number(row.quantity),
                date: new Date(row.date).toISOString(),
            })),
        );

        return {
            data: transformedData,
            pagination: {
                hasNext,
                nextCursor,
                limit,
            },
        };
    }

    async createTransaction(
        userId: number,
        itemId: number,
        stock: number,
        transactionType: TransactionType,
    ): Promise<boolean> {
        await this.databaseService.query(
            `INSERT INTO stock_transactions (user_id, item_id, quantity, transaction_type_id)
            VALUES ($1, $2, $3, $4);`,
            [userId, itemId, stock, transactionType],
        );

        return true;
    }

    async pushAIJob(
        itemId: number,
        jobType: 'train' | 'forecast',
    ): Promise<string> {
        const item = await this.itemsService.findOne(itemId);
        if (!item) {
            throw new Error('Item not found.');
        }
        let jobId: string;
        if (jobType === 'train') {
            jobId = await this.rabbitMQService.insertTrainTask(itemId);
        } else if (jobType === 'forecast') {
            jobId = await this.rabbitMQService.insertForecastTask(itemId);
        }
        return jobId;
    }

    async getJobs(itemId: number): Promise<Job[]> {
        return this.rabbitMQService.findAllJobs(itemId);
    }
}
