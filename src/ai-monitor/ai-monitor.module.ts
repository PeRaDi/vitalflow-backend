import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from '../db/database.module';
import { ItemsModule } from '../items/items.module';

import { AiMonitorCron } from './ai-monitor.cron';
import { AiMonitorListener } from './ai-monitor.listener';
import { AiMonitorService } from './ai-monitor.service';

@Module({
    imports: [ScheduleModule.forRoot(), DatabaseModule, ItemsModule],
    providers: [AiMonitorService, AiMonitorCron, AiMonitorListener],
})
export class AiMonitorModule {}
