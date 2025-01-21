import { Injectable } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: process.env.DATABASE_MAX_POOL_SIZE,
            idleTimeoutMillis: process.env.DATABASE_IDLE_TIMEOUT,
            connectionTimeoutMillis: process.env.DATABASE_CONNECTION_TIMEOUT,
        });
    }

    async query(
        queryText: string,
        params?: any[],
        returnFullResult = false,
    ): Promise<any> {
        const client = await this.pool.connect();
        try {
            const res = await client.query(queryText, params);
            return returnFullResult ? res : res.rows;
        } catch (error) {
            console.error('Database query error:', {
                queryText,
                params,
                error,
            });
            throw error;
        } finally {
            client.release();
        }
    }

    async transaction<T>(
        callback: (client: PoolClient) => Promise<T>,
    ): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
    }
}
