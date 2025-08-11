import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import * as amqp from 'amqplib';
import { randomUUID, UUID } from 'crypto';

import { DatabaseService } from '../db/database.service';

import { Job } from './interfaces/job.interface';
import { rabbitMQConfig } from './rabbitmq.config';
import { JobStatus } from './types/job-status.enum';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
    private backendClient: ClientProxy;
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.backendClient = ClientProxyFactory.create(rabbitMQConfig(configService));
        this.initializeRabbitMQ();
    }

    private async initializeRabbitMQ(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.configService.get<string>('RABBITMQ_URL'));
            this.channel = await this.connection.createChannel();

            const trainerQueue = this.configService.get<string>('RABBITMQ_TRAINER_QUEUE');
            const forecasterQueue = this.configService.get<string>('RABBITMQ_FORECASTER_QUEUE');

            await this.channel.assertQueue(trainerQueue, {
                durable: false,
            });
            await this.channel.assertQueue(forecasterQueue, {
                durable: false,
            });

            console.log(`RabbitMQ queues initialized: ${trainerQueue}, ${forecasterQueue}`);
        } catch (error) {
            console.error('Failed to initialize RabbitMQ connection:', error);
            throw error;
        }
    }

    private async ensureConnection(): Promise<void> {
        if (!this.connection || !this.channel) {
            await this.initializeRabbitMQ();
        }
    }

    async insertTrainTask(itemId: number): Promise<string> {
        await this.ensureConnection();
        const uuid = randomUUID();

        try {
            const message = JSON.stringify({
                job_id: uuid,
                item_id: itemId,
            });

            await this.channel.sendToQueue(
                this.configService.get<string>('RABBITMQ_TRAINER_QUEUE'),
                Buffer.from(message),
                { persistent: false },
            );
        } catch (error) {
            console.error('Failed to publish train task to queue:', error);
            throw error;
        }

        await this.databaseService.query(
            'INSERT INTO jobs("id", "itemId", "queue", "status", "modifiedAt", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
            [uuid, itemId, 'TRAINER', 'PROCESSING', new Date(), new Date()],
        );
        return uuid;
    }

    async insertForecastTask(itemId: number): Promise<string> {
        await this.ensureConnection();
        const uuid = randomUUID();

        try {
            const message = JSON.stringify({
                job_id: uuid,
                item_id: itemId,
            });

            await this.channel.sendToQueue(
                this.configService.get<string>('RABBITMQ_FORECASTER_QUEUE'),
                Buffer.from(message),
                { persistent: false },
            );
        } catch (error) {
            console.error('Failed to publish forecast task to queue:', error);
            throw error;
        }

        await this.databaseService.query(
            'INSERT INTO jobs("id", "itemId", "queue", "status", "modifiedAt", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
            [uuid, itemId, 'FORECASTER', 'PROCESSING', new Date(), new Date()],
        );

        return uuid;
    }

    async handleSuccess(jobId: UUID, result: any): Promise<void> {
        const updatedJob = await this.databaseService.query(
            'UPDATE jobs SET "status" = $1, "modifiedAt" = NOW(), "result" = $2 WHERE id = $3 RETURNING *',
            [JobStatus.SUCCESS, JSON.stringify(result), jobId],
        );

        const job: Job = updatedJob[0];
        this.eventEmitter.emit(`job.ai.success`, {
            job,
        });
    }

    async handlerError(jobId: UUID, error: string): Promise<void> {
        await this.databaseService.query(
            'UPDATE jobs SET "status" = $1, "modifiedAt" = NOW(), "result" = $2 WHERE id = $3',
            [JobStatus.ERROR, JSON.stringify({ error }), jobId],
        );
    }

    async handleNotFound(jobId: UUID): Promise<void> {
        await this.databaseService.query(
            'UPDATE jobs SET "status" = $1, "modifiedAt" = NOW(), "result" = $2 WHERE id = $3',
            [JobStatus.NOT_FOUND, JSON.stringify({ message: 'Data not found for processing' }), jobId],
        );
    }

    async handleTimeout(jobId: UUID): Promise<void> {
        await this.databaseService.query(
            'UPDATE jobs SET "status" = $1, "modifiedAt" = NOW(), "result" = $2 WHERE id = $3',
            [JobStatus.TIMEOUT, JSON.stringify({ message: 'Job processing timeout' }), jobId],
        );
    }

    async markJobForRetry(jobId: UUID): Promise<void> {
        await this.databaseService.query(
            'UPDATE jobs SET "status" = $1, "modifiedAt" = NOW(), "retry_count" = "retry_count" + 1 WHERE id = $2',
            [JobStatus.PROCESSING, jobId],
        );
    }

    async findTimeoutJobs(timeoutMinutes: number = 60): Promise<Job[]> {
        const timeoutThreshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);
        const result = await this.databaseService.query(
            'SELECT * FROM jobs WHERE "status" = $1 AND "modifiedAt" < $2',
            [JobStatus.PROCESSING, timeoutThreshold],
        );

        return result.map((row) => ({
            id: row.id,
            itemId: row.itemId,
            queue: row.queue,
            status: row.status,
            createdAt: new Date(row.createdAt),
            modifiedAt: new Date(row.modifiedAt),
            result: row.result,
        }));
    }

    async findJobsToRetry(): Promise<Job[]> {
        const retryThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await this.databaseService.query(
            `SELECT * FROM jobs 
             WHERE "status" IN ($1, $2, $3) 
             AND "modifiedAt" < $4 
             AND ("retry_count" IS NULL OR "retry_count" < 3)`,
            [JobStatus.ERROR, JobStatus.TIMEOUT, JobStatus.NOT_FOUND, retryThreshold],
        );

        return result.map((row) => ({
            id: row.id,
            itemId: row.itemId,
            queue: row.queue,
            status: row.status,
            createdAt: new Date(row.createdAt),
            modifiedAt: new Date(row.modifiedAt),
            result: row.result,
        }));
    }

    async findAllJobs(itemId: number): Promise<Job[]> {
        const result = await this.databaseService.query('SELECT * FROM jobs WHERE "itemId" = $1', [itemId]);

        return result.map((row) => ({
            id: row.id,
            itemId: row.itemId,
            queue: row.queue,
            status: row.status,
            createdAt: new Date(row.createdAt),
            modifiedAt: new Date(row.modifiedAt),
            result: row.result,
        }));
    }

    async republishTask(jobId: string, itemId: number, queue: 'TRAINER' | 'FORECASTER'): Promise<void> {
        await this.ensureConnection();
        try {
            const message = JSON.stringify({
                job_id: jobId,
                item_id: itemId,
            });

            const queueName =
                queue === 'TRAINER'
                    ? this.configService.get<string>('RABBITMQ_TRAINER_QUEUE')
                    : this.configService.get<string>('RABBITMQ_FORECASTER_QUEUE');

            await this.channel.sendToQueue(queueName, Buffer.from(message), { persistent: false });
        } catch (error) {
            console.error(`Failed to republish ${queue.toLowerCase()} task to queue:`, error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}
