import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { DatabaseModule } from 'src/db/database.module';
import { MailModule } from 'src/mail/mail.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
  imports: [
    DatabaseModule,
    MailModule,
    UsersModule,
    RolesModule
  ],
  exports: [TenantsService],
})
export class TenantsModule { }
