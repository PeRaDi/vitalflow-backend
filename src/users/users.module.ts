import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsersController } from './user.controller';
import { UsersService } from './users.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
    imports: [DatabaseModule, RolesModule],
})
export class UsersModule {}
