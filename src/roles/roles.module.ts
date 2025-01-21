import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { RolesService } from './roles.service';

@Module({
    providers: [RolesService],
    imports: [DatabaseModule],
    exports: [RolesService],
})
export class RolesModule {}
