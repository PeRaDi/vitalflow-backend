import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

@Module({
    controllers: [ManagerController],
    providers: [ManagerService],
    imports: [],
})
export class ManagerModule {}
