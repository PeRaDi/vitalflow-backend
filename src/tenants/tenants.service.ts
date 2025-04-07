import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { Role } from 'src/entities/role.entity';
import { TenantContact } from 'src/entities/tenant-contact.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { User } from 'src/entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class TenantsService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly mailService: MailService,
    ) {}

    async create(
        name: string,
        email: string,
        address: string,
    ): Promise<Tenant | null> {
        const query =
            'INSERT INTO tenants (name, address, email) VALUES ($1, $2, $3) RETURNING *;';
        const params = [name, address, email];

        const result = await this.databaseService.query(query, params);

        if (result.length == 0) return null;

        const tenant: Tenant = {
            id: result[0].id,
            name: result[0].name,
            email: result[0].email,
            address: result[0].address,
            active: result[0].active,
            createdAt: result[0].createdAt,
            updatedAt: result[0].updatedAt,
        };

        return tenant;
    }

    async findAll(): Promise<Tenant[]> {
        const query = 'SELECT * FROM tenants;';
        const result = await this.databaseService.query(query);

        if (result.length == 0) return null;

        const tenants: Tenant[] = result.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            address: row.address,
            active: row.active,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));

        return tenants;
    }

    async findOne(tenantId: number): Promise<Tenant | null> {
        const query = 'SELECT * FROM tenants WHERE id = $1;';
        const result = await this.databaseService.query(query, [tenantId]);

        if (result.length == 0) return null;

        const tenant: Tenant = {
            id: result[0].id,
            name: result[0].name,
            email: result[0].email,
            address: result[0].address,
            active: result[0].active,
            createdAt: result[0].createdAt,
            updatedAt: result[0].updatedAt,
        };

        return tenant;
    }

    async findMany(tenantIds: number[]): Promise<Tenant[] | null> {
        const query = 'SELECT * FROM tenants WHERE id IN ($1);';
        const result = await this.databaseService.query(query, [tenantIds]);

        if (result.length == 0) return null;

        const tenants: Tenant[] = result.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            address: row.address,
            active: row.active,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));

        return tenants;
    }

    async update(tenant: Tenant): Promise<Tenant | null> {
        const query =
            'UPDATE tenants SET name = $1, email = $2, address = $3, active = $4, updated_at = $5 WHERE id = $6 RETURNING *;';
        const params = [
            tenant.name,
            tenant.email,
            tenant.address,
            tenant.active,
            new Date(),
            tenant.id,
        ];
        const result = await this.databaseService.query(query, params);

        if (result.length == 0) return null;

        return tenant;
    }

    async toggle(tenant: Tenant): Promise<boolean> {
        const query =
            'UPDATE tenants SET active = NOT active, updated_at = $1 WHERE id = $2 RETURNING *;';
        const params = [new Date(), tenant.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async inviteUser(
        managerUser: User,
        email: string,
        tenant: Tenant,
        role: Role,
    ): Promise<boolean> {
        const query = `
        INSERT INTO signup_tokens (
            token,
            inviter_id,
            tenant_id,
            role_id,
            user_email
        ) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;

        const token = Math.floor(100000 + Math.random() * 900000);
        const params = [token, managerUser.id, tenant.id, role.id, email];

        const result = await this.databaseService.query(query, params);
        if (result.length === 0) return false;

        this.mailService.sendSignupInviteEmail(email, '[CHANGETHIS]', token);
        return true;
    }

    async getContacts(tenantId: number): Promise<TenantContact[]> {
        const query = 'SELECT * FROM tenant_contacts WHERE tenant_id = $1;';
        const result = await this.databaseService.query(query, [tenantId]);

        if (result.length == 0) return [];

        const contacts: TenantContact[] = result.map((row) => ({
            id: row.id,
            contact: row.contact,
            info: row.info,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));

        return contacts;
    }

    async addContacts(
        tenantId: number,
        contactNumbers: number[],
        contactInfos: string[],
    ): Promise<boolean> {
        const query =
            'INSERT INTO tenant_contacts (tenant_id, contact, info) VALUES ($1, $2, $3) RETURNING *;';

        for (let i = 0; i < contactNumbers.length; i++) {
            const params = [tenantId, contactNumbers[i], contactInfos[i]];
            const result = await this.databaseService.query(query, params);

            if (result.length == 0) return false;
        }

        return true;
    }

    async deleteContacts(
        tenantId: number,
        contactsIds: number[],
    ): Promise<boolean> {
        const query =
            'DELETE FROM tenant_contacts WHERE tenant_id = $1 AND id = $2 RETURNING *;';
        for (const contactId of contactsIds) {
            const params = [tenantId, contactId];
            const result = await this.databaseService.query(query, params);

            if (result.length == 0) return false;
        }

        return true;
    }

    async updateContact(
        tenantId: number,
        contactId: number,
        contactNumber: number,
        contactInfo: string,
    ): Promise<boolean> {
        const query =
            'UPDATE tenant_contacts SET contact = $1, info = $2, updated_at = $3 WHERE tenant_id = $4 AND id = $5 RETURNING *;';
        const params = [
            contactNumber,
            contactInfo,
            new Date(),
            tenantId,
            contactId,
        ];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async getUsers(tenantId: number): Promise<User[]> {
        const query = `
            SELECT 
                u.id AS user_id,
                u.email,
                u.username,
                u.name,
                u.password,
                u.created_at,
                u.updated_at,
                u.active,
                u.tenant_id,
                r.id AS role_id,
                r.label AS role_label,
                r.display_name AS role_display_name,
                r.level AS role_level,
                r.created_at AS role_created_at,
                r.updated_at AS role_updated_at
            FROM users u
            LEFT JOIN 
                roles r ON u.role_id = r.id
            WHERE 
                u.tenant_id = $1;
        `;

        const result = await this.databaseService.query(query, [tenantId]);

        if (result.length == 0) return [];

        const users: User[] = result.map((row) => ({
            id: row.user_id,
            email: row.email,
            username: row.username,
            name: row.name,
            password: row.password,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            active: row.active,
            tenantId: row.tenant_id,
            role: {
                id: row.role_id,
                label: row.role_label,
                displayName: row.role_display_name,
                level: row.role_level,
                createdAt: row.role_created_at,
                updatedAt: row.role_updated_at,
            },
        }));

        return users;
    }

    async getInvites(tenantId: number): Promise<any[]> {
        let result;
        if (tenantId === -1) {
            const query = `
                SELECT 
                    u.id, 
                    u.inviter_id, 
                    u.tenant_id, 
                    u.user_email,
                    r.id AS role_id,
                    r.label AS role_label,
                    r.display_name AS role_display_name,
                    r.level AS role_level,
                    r.created_at AS role_created_at,
                    r.updated_at AS role_updated_at,
                    t.id AS tenant_id,
                    t.name AS tenant_name,
                    t.email AS tenant_email,
                    t.address AS tenant_address,
                    t.created_at AS tenant_created_at,
                    t.updated_at AS tenant_updated_at,
                    t.active AS tenant_active
                FROM signup_tokens u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN tenants t ON u.tenant_id = t.id;
            `;

            result = await this.databaseService.query(query);
        } else {
            const query = `
                SELECT 
                    u.id, 
                    u.inviter_id, 
                    u.tenant_id, 
                    u.user_email,
                    r.id AS role_id,
                    r.label AS role_label,
                    r.display_name AS role_display_name,
                    r.level AS role_level,
                    r.created_at AS role_created_at,
                    r.updated_at AS role_updated_at,
                    t.id AS tenant_id,
                    t.name AS tenant_name,
                    t.email AS tenant_email,
                    t.address AS tenant_address,
                    t.created_at AS tenant_created_at,
                    t.updated_at AS tenant_updated_at,
                    t.active AS tenant_active
                FROM signup_tokens u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN tenants t ON u.tenant_id = t.id
                WHERE u.tenant_id = $1;
            `;

            result = await this.databaseService.query(query, [tenantId]);
        }

        if (result.length == 0) return [];

        const invitedUsers: any[] = result.map((row) => ({
            id: row.id,
            inviterId: row.inviter_id,
            tenantId: row.tenant_id,
            email: row.user_email,
            role: {
                id: row.role_id,
                label: row.role_label,
                displayName: row.role_display_name,
                level: row.role_level,
                createdAt: row.role_created_at,
                updatedAt: row.role_updated_at,
            },
            tenant: {
                id: row.tenant_id,
                name: row.tenant_name,
                email: row.tenant_email,
                address: row.tenant_address,
                createdAt: row.tenant_created_at,
                updatedAt: row.tenant_updated_at,
                active: row.tenant_active,
            },
        }));

        return invitedUsers;
    }
}
