import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { UsersController } from './user.controller';
import { UsersService } from './users.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
    imports: [DatabaseModule],
})
export class UsersModule {}
