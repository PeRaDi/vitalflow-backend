import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

export const rabbitMQConfig = (configService: ConfigService): RmqOptions => ({
    transport: Transport.RMQ,
    options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: configService.get<string>('RABBITMQ_BACKEND_QUEUE'),
        queueOptions: {
            durable: true,
        },
    },
});
