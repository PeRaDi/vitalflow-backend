import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { UsersModule } from 'src/users/users.module';
import { ItemsController } from './controllers/items.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { ItemsService } from './services/items.service';
import { TransactionsService } from './services/transactions.service';

@Module({
    controllers: [ItemsController, TransactionsController],
    imports: [DatabaseModule, RabbitMQModule, UsersModule],
    providers: [ItemsService, TransactionsService],
    exports: [ItemsService],
})
export class ItemsModule {}
