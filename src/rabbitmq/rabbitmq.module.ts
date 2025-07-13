import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/db/database.module';
import { RabbitMQListener } from './rabbitmq.listener';
import { RabbitMQService } from './rabbitmq.service';

@Module({
    imports: [ConfigModule, DatabaseModule],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
    controllers: [RabbitMQListener],
})
export class RabbitMQModule {}
