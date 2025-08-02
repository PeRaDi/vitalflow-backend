import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModule } from './admin/admin.module';
import { AiMonitorModule } from './ai-monitor/ai-monitor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/database.module';
import { ItemsModule } from './items/items.module';
import { MailModule } from './mail/mail.module';
import { ManagerModule } from './manager/manager.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { RolesModule } from './roles/roles.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        EventEmitterModule.forRoot(),
        AuthModule,
        UsersModule,
        DatabaseModule,
        MailModule,
        AdminModule,
        TenantsModule,
        RolesModule,
        ManagerModule,
        RabbitMQModule,
        ItemsModule,
        AiMonitorModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
