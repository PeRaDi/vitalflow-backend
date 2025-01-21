import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './db/database.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { TenantsModule } from './tenants/tenants.module';
import { RolesModule } from './roles/roles.module';
import { ManagerModule } from './manager/manager.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UsersModule,
        DatabaseModule,
        MailModule,
        AdminModule,
        TenantsModule,
        RolesModule,
        ManagerModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
