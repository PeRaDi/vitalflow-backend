import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { randomUUID, UUID } from 'crypto';
import { DatabaseService } from 'src/db/database.service';
import { Job } from './interfaces/job.interface';
import { rabbitMQConfig } from './rabbitmq.config';
import { JobStatus } from './types/job-status.enum';

@Injectable()
export class RabbitMQService {
    private backendClient: ClientProxy;
    private trainerClient: ClientProxy;
    private forecasterClient: ClientProxy;

    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.backendClient = ClientProxyFactory.create(rabbitMQConfig(configService));

        this.trainerClient = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: [this.configService.get<string>('RABBITMQ_URL')],
                queue: this.configService.get<string>('RABBITMQ_TRAINER_QUEUE'),
                queueOptions: {
                    durable: false,
                },
            },
        });

        this.forecasterClient = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: [this.configService.get<string>('RABBITMQ_URL')],
                queue: this.configService.get<string>('RABBITMQ_FORECASTER_QUEUE'),
                queueOptions: {
                    durable: false,
                },
            },
        });
    }

    async insertTrainTask(itemId: number): Promise<string> {
        const uuid = randomUUID();

        await this.trainerClient
            .send('trainer', {
                job_id: uuid,
                item_id: itemId,
            })
            .toPromise();

        await this.databaseService.query(
            'INSERT INTO jobs("id", "itemId", "queue", "status", "modifiedAt", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
            [uuid, itemId, 'TRAINER', 'PROCESSING', new Date(), new Date()],
        );
        return uuid;
    }

    async insertForecastTask(itemId: number): Promise<string> {
        const uuid = randomUUID();
        const data = await this.forecasterClient
            .send('forecaster', {
                job_id: uuid,
                item_id: itemId,
            })
            .toPromise();

        if (data && data['status'] === 'NOT_FOUND') {
            return null;
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
}
