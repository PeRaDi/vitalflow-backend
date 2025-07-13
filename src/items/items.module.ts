import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
    controllers: [ItemsController],
    imports: [DatabaseModule],
    providers: [ItemsService],
    exports: [ItemsService],
})
export class ItemsModule {}
