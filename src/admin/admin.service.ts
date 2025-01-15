import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { Role } from 'src/entities/role.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { User } from 'src/entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AdminService {
    constructor(private dbService: DatabaseService, private mailService: MailService) { }

    async inviteUser(adminUser: User, email: string, tenant: Tenant, role: Role): Promise<boolean> {
        const query = `
        INSERT INTO signup_tokens (token, admin_id, tenant_id, role_id, user_email) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;

        const token = Math.floor(100000 + Math.random() * 900000);
        const params = [token, adminUser.id, tenant.id, role.id, email];

        const result = await this.dbService.query(query, params);
        if (result.length === 0)
            return false;

        this.mailService.sendSignupInviteEmail(email, "[CHANGETHIS]", token);
        return true;
    }
}
