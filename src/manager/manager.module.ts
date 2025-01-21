import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';

@Module({
  controllers: [ManagerController],
  providers: [ManagerService],
  imports: [],
})
export class ManagerModule { }
