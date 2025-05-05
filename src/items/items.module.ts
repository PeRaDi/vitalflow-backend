import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
    controllers: [ItemsController],
    imports: [DatabaseModule, TenantsModule],
    providers: [ItemsService],
})
export class ItemsModule {}
