import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { UsersService } from './users.service';
import { TenantsModule } from 'src/tenants/tenants.module';
import { RolesModule } from 'src/roles/roles.module';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from './user.controller';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
    imports: [
        DatabaseModule,
        TenantsModule,
        RolesModule,
        MailModule,
    ],
})
export class UsersModule { }
