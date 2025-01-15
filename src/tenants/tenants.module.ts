import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { DatabaseModule } from 'src/db/database.module';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
  imports: [DatabaseModule],
  exports: [TenantsService],
})
export class TenantsModule { }
