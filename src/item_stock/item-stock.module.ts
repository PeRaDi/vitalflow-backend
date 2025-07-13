import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { ItemsModule } from 'src/items/items.module';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { ItemStockController } from './item-stock.controller';
import { ItemStockService } from './item.stock.service';

@Module({
    controllers: [ItemStockController],
    imports: [DatabaseModule, ItemsModule, RabbitMQModule],
    providers: [ItemStockService],
})
export class ItemStockModule {}
