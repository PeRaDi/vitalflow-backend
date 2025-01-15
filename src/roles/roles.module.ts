import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { DatabaseModule } from 'src/db/database.module';

@Module({
  providers: [RolesService],
  imports: [DatabaseModule],
  exports: [RolesService],
})
export class RolesModule { }
