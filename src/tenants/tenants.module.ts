import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/database.module';
import { MailModule } from 'src/mail/mail.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
    controllers: [TenantsController],
    providers: [TenantsService],
    imports: [DatabaseModule, MailModule, UsersModule, RolesModule],
    exports: [TenantsService],
})
export class TenantsModule {}
