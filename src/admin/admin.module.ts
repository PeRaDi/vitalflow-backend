import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from 'src/db/database.module';
import { MailModule } from 'src/mail/mail.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { RolesModule } from 'src/roles/roles.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    controllers: [AdminController],
    providers: [AdminService],
    imports: [
        DatabaseModule,
        MailModule,
        AuthModule,
        UsersModule,
        TenantsModule,
        RolesModule
    ],
})

export class AdminModule { }
