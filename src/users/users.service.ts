import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/db/database.service';
import { Role } from 'src/entities/role.entity';
import { SignupToken } from 'src/entities/signup-token.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { User } from 'src/entities/user.entity';
import ErrorResponse from 'src/responses/error-response';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(
        email: string,
        username: string,
        password: string,
        name: string,
        signupToken?: SignupToken,
    ): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query =
            'INSERT INTO users (email, username, password, name, role_id, tenant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
        const params = [
            email,
            username,
            hashedPassword,
            name,
            signupToken.roleId,
            signupToken.tenantId,
        ];

        const result = await this.databaseService.query(query, params);

        if (result.length == 0) return null;

        const user: User = {
            id: result[0].id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            name: result[0].name,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active,
        };

        return user;
    }

    async createAdmin(
        email: string,
        username: string,
        password: string,
        name: string,
    ): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const rolesQuery = 'SELECT * FROM roles WHERE label=$1;';

        const rolesResult = await this.databaseService.query(rolesQuery, [
            'ADMIN',
        ]);
        if (rolesResult.length == 0)
            throw new ErrorResponse(
                'Admin role not found.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        const queryAdmin =
            'INSERT INTO users (email, username, password, name, role_id, tenant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
        const paramsAdmin = [
            email,
            username,
            hashedPassword,
            name,
            rolesResult[0].id,
            null,
        ];

        const result = await this.databaseService.query(
            queryAdmin,
            paramsAdmin,
        );

        if (result.length == 0) return null;

        const user: User = {
            id: result[0].id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            name: result[0].name,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active,
        };
        return user;
    }

    async findAll(): Promise<User[]> {
        const query = `
            SELECT 
                u.id AS user_id,
                u.email,
                u.username,
                u.name,
                u.password,
                u.change_password_token,
                u.change_password_token_expiry,
                u.created_at,
                u.updated_at,
                u.active,
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
            FROM users u
            LEFT JOIN 
                roles r ON u.role_id = r.id
            LEFT JOIN 
                tenants t ON u.tenant_id = t.id;
        `;

        const result = await this.databaseService.query(query);

        const users: User[] = result.map((row) => {
            const tenant: Tenant = {
                id: row.tenant_id,
                name: row.tenant_name,
                email: row.tenant_email,
                address: row.tenant_address,
                createdAt: row.tenant_created_at,
                updatedAt: row.tenant_updated_at,
                active: row.tenant_active,
            };

            const role: Role = {
                id: row.role_id,
                label: row.role_label,
                displayName: row.role_display_name,
                level: row.role_level,
                createdAt: row.role_created_at,
                updatedAt: row.role_updated_at,
            };

            const user: User = {
                id: row.user_id,
                email: row.email,
                username: row.username,
                password: row.password,
                name: row.name,
                changePasswordToken: row.change_password_token,
                changePasswordTokenExpiry: row.change_password_token_expiry,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                active: row.active,
                role: role,
                tenant: tenant,
            };

            return user;
        });

        return users;
    }

    async findOne(userId: number): Promise<User | null> {
        const query = `
            SELECT 
                u.id AS user_id,
                u.email,
                u.username,
                u.name,
                u.password,
                u.change_password_token,
                u.change_password_token_expiry,
                u.created_at,
                u.updated_at,
                u.active,
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
            FROM users u
            LEFT JOIN 
                roles r ON u.role_id = r.id
            LEFT JOIN 
                tenants t ON u.tenant_id = t.id
            WHERE 
                u.id = $1;
        `;

        const result = await this.databaseService.query(query, [userId]);

        if (result.length == 0) return null;

        const tenant: Tenant = {
            id: result[0].tenant_id,
            name: result[0].tenant_name,
            email: result[0].tenant_email,
            address: result[0].tenant_address,
            createdAt: result[0].tenant_created_at,
            updatedAt: result[0].tenant_updated_at,
            active: result[0].tenant_active,
        };

        const role: Role = {
            id: result[0].role_id,
            label: result[0].role_label,
            displayName: result[0].role_display_name,
            level: result[0].role_level,
            createdAt: result[0].role_created_at,
            updatedAt: result[0].role_updated_at,
        };

        const user: User = {
            id: result[0].user_id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            changePasswordToken: result[0].change_password_token,
            changePasswordTokenExpiry: result[0].change_password_token_expiry,
            name: result[0].name,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active,
            role: role,
            tenant: tenant,
        };

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const query = `
            SELECT 
                u.id AS user_id,
                u.email,
                u.username,
                u.name,
                u.password,
                u.change_password_token,
                u.change_password_token_expiry,
                u.created_at,
                u.updated_at,
                u.active,
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
            FROM users u
            LEFT JOIN 
                roles r ON u.role_id = r.id
            LEFT JOIN 
                tenants t ON u.tenant_id = t.id
            WHERE 
                u.email = $1;
        `;
        const result = await this.databaseService.query(query, [email]);

        if (result.length == 0) return null;

        const tenant: Tenant = {
            id: result[0].tenant_id,
            name: result[0].tenant_name,
            email: result[0].tenant_email,
            address: result[0].tenant_address,
            createdAt: result[0].tenant_created_at,
            updatedAt: result[0].tenant_updated_at,
            active: result[0].tenant_active,
        };

        const role: Role = {
            id: result[0].role_id,
            label: result[0].role_label,
            displayName: result[0].role_display_name,
            level: result[0].role_level,
            createdAt: result[0].role_created_at,
            updatedAt: result[0].role_updated_at,
        };

        const user: User = {
            id: result[0].user_id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            name: result[0].name,
            changePasswordToken: result[0].change_password_token,
            changePasswordTokenExpiry: result[0].change_password_token_expiry,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active,
            role: role,
            tenant: tenant,
        };

        return user;
    }

    async findByUsername(username: string): Promise<User | null> {
        const query = `
            SELECT 
                u.id AS user_id,
                u.email,
                u.username,
                u.name,
                u.password,
                u.change_password_token,
                u.change_password_token_expiry,
                u.created_at,
                u.updated_at,
                u.active,
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
            FROM users u
            LEFT JOIN 
                roles r ON u.role_id = r.id
            LEFT JOIN 
                tenants t ON u.tenant_id = t.id
            WHERE 
                u.username = $1;
        `;
        const result = await this.databaseService.query(query, [username]);

        if (result.length == 0) return null;

        const tenant: Tenant = {
            id: result[0].tenant_id,
            name: result[0].tenant_name,
            email: result[0].tenant_email,
            address: result[0].tenant_address,
            createdAt: result[0].tenant_created_at,
            updatedAt: result[0].tenant_updated_at,
            active: result[0].tenant_active,
        };

        const role: Role = {
            id: result[0].role_id,
            label: result[0].role_label,
            displayName: result[0].role_display_name,
            level: result[0].role_level,
            createdAt: result[0].role_created_at,
            updatedAt: result[0].role_updated_at,
        };

        const user: User = {
            id: result[0].user_id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            name: result[0].name,
            changePasswordToken: result[0].change_password_token,
            changePasswordTokenExpiry: result[0].change_password_token_expiry,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active,
            role: role,
            tenant: tenant,
        };

        return user;
    }

    async findMany(userIds: number[]): Promise<User[] | null> {
        const query = `
            SELECT 
                u.id AS user_id,
                u.email,
                u.username,
                u.name,
                u.password,
                u.change_password_token,
                u.change_password_token_expiry,
                u.created_at,
                u.updated_at,
                u.active,
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
            FROM users u
            LEFT JOIN 
                roles r ON u.role_id = r.id
            LEFT JOIN 
                tenants t ON u.tenant_id = t.id
            WHERE 
                u.id = ANY($1);
        `;
        const result = await this.databaseService.query(query, [userIds]);

        if (result.length == 0) return null;

        const users: User[] = result.map((row) => {
            const tenant: Tenant = {
                id: row.tenant_id,
                name: row.tenant_name,
                email: row.tenant_email,
                address: row.tenant_address,
                createdAt: row.tenant_created_at,
                updatedAt: row.tenant_updated_at,
                active: row.tenant_active,
            };

            const role: Role = {
                id: row.role_id,
                label: row.role_label,
                displayName: row.role_display_name,
                level: row.role_level,
                createdAt: row.role_created_at,
                updatedAt: row.role_updated_at,
            };

            const user: User = {
                id: row.user_id,
                email: row.email,
                username: row.username,
                password: row.password,
                name: row.name,
                changePasswordToken: result[0].change_password_token,
                changePasswordTokenExpiry:
                    result[0].change_password_token_expiry,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                active: row.active,
                role: role,
                tenant: tenant,
            };

            return user;
        });

        return users;
    }

    async update(user: User): Promise<User | null> {
        const query =
            'UPDATE users SET email = $1, username = $2, name = $3, change_password_token = $4, change_password_token_expiry = $5, role_id = $6, tenant_id = $7, updated_at = $8 WHERE id = $9 RETURNING *;';
        const params = [
            user.email,
            user.username,
            user.name,
            user.changePasswordToken,
            user.changePasswordTokenExpiry,
            user.role.id,
            user.tenant.id,
            new Date(),
            user.id,
        ];
        const result = await this.databaseService.query(query, params);

        if (result.length == 0) return null;

        return user;
    }

    async updatePassword(user: User, password: string): Promise<boolean> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query =
            'UPDATE users SET password = $1, updated_at = $2 WHERE id = $3 RETURNING *;';
        const params = [hashedPassword, new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async toggle(user: User): Promise<boolean> {
        const query =
            'UPDATE users SET active = NOT active, updated_at = $1 WHERE id = $2 RETURNING *;';
        const params = [new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async clearPasswordResetToken(user: User): Promise<boolean> {
        const query =
            'UPDATE users SET change_password_token = NULL, updated_at = $1 WHERE id = $2 RETURNING *;';
        const params = [new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async changePassword(user: User, newPassword: string): Promise<boolean> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query =
            'UPDATE users SET password = $1, updated_at = $2 WHERE id = $3 RETURNING *;';
        const params = [hashedPassword, new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async deleteSignupTokens(userEmail: string): Promise<boolean> {
        const query = 'DELETE FROM signup_tokens WHERE user_email = $1;';
        await this.databaseService.query(query, [userEmail]);

        return true;
    }
}
