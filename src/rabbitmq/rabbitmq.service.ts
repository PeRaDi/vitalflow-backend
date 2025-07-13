import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ClientProxy,
    ClientProxyFactory,
    Transport,
} from '@nestjs/microservices';
import { randomUUID, UUID } from 'crypto';
import { DatabaseService } from 'src/db/database.service';
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
    ) {
        this.backendClient = ClientProxyFactory.create(
            rabbitMQConfig(configService),
        );

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
                queue: this.configService.get<string>(
                    'RABBITMQ_FORECASTER_QUEUE',
                ),
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
            .subscribe(() => {
                this.databaseService.query(
                    'INSERT INTO jobs("id", "itemId", "queue", "status", "modifiedAt", "createdAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
                    [uuid, itemId, 'TRAINER', 'PROCESSING'],
                );
            });

        return uuid;
    }

    async insertForecastTask(itemId: number): Promise<string> {
        const uuid = randomUUID();

        await this.forecasterClient
            .send('forecaster', {
                job_id: uuid,
                item_id: itemId,
            })
            .subscribe(() => {
                this.databaseService.query(
                    'INSERT INTO jobs("id", "itemId", "queue", "status", "modifiedAt", "createdAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
                    [uuid, itemId, 'FORECASTER', 'PROCESSING'],
                );
            });

        return uuid;
    }

    async handleSuccess(jobId: UUID, result: any): Promise<void> {
        await this.databaseService.query(
            'UPDATE jobs SET "status" = $1, "modifiedAt" = NOW(), "result" = $2 WHERE id = $3',
            [JobStatus.SUCCESS, JSON.stringify(result), jobId],
        );
    }

    async handlerError(jobId: UUID, error: string): Promise<void> {
        await this.databaseService.query(
            'UPDATE jobs SET "status" = $1, "modifiedAt" = NOW(), "result" = $2 WHERE id = $3',
            [JobStatus.ERROR, JSON.stringify({ error }), jobId],
        );
    }
}
