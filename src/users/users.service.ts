import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SignupToken } from 'src/entities/signup-token.entity';
import ErrorResponse from 'src/responses/error-response';

@Injectable()
export class UsersService {
    constructor(private databaseService: DatabaseService) { }

    async create(email: string, username: string, password: string, name: string, signupToken?: SignupToken): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, username, password, name, role_id, tenant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
        const params = [email, username, hashedPassword, name, signupToken.roleId, signupToken.tenantId];

        const result = await this.databaseService.query(query, params);

        if (result.length == 0)
            return null;

        const user: User = {
            id: result[0].id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            name: result[0].name,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active
        };

        return user;
    }

    async createAdmin(email: string, username: string, password: string, name: string): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const rolesQuery = "SELECT * FROM roles WHERE label=$1;";

        const rolesResult = await this.databaseService.query(rolesQuery, ["ADMIN"]);
        if (rolesResult.length == 0)
            throw new ErrorResponse("Admin role not found.", HttpStatus.INTERNAL_SERVER_ERROR);

        const queryAdmin = 'INSERT INTO users (email, username, password, name, role_id, tenant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
        const paramsAdmin = [email, username, hashedPassword, name, rolesResult[0].id, null];

        const result = await this.databaseService.query(queryAdmin, paramsAdmin);

        if (result.length == 0)
            return null;

        const user: User = {
            id: result[0].id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            name: result[0].name,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active
        };
        return user;
    }

    async findAll(): Promise<User[]> {
        const query = 'SELECT * FROM users;';

        return await this.databaseService.query(query);
    }

    async findOne(userId: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1;';
        const result = await this.databaseService.query(query, [userId]);

        if (result.length == 0)
            return null;

        const user: User = {
            id: result[0].id,
            email: result[0].email,
            username: result[0].username,
            password: result[0].password,
            name: result[0].name,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            active: result[0].active
        };

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1;';
        const result = await this.databaseService.query(query, [email]);

        return result.length > 0 ? result[0] : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE username = $1;';
        const result = await this.databaseService.query(query, [username]);

        return result.length > 0 ? result[0] : null;
    }

    async findMany(userIds: number[]): Promise<User[] | null> {
        const query = 'SELECT * FROM users WHERE id IN ($1);';
        const result = await this.databaseService.query(query, [userIds]);

        if (result.length == 0)
            return null;

        const users: User[] = result.map(row => ({
            id: row.id,
            email: row.email,
            username: row.username,
            password: row.password,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            active: row.active
        }));

        return users;
    }

    async update(user: User): Promise<User | null> {
        const query = 'UPDATE users SET email = $1, username = $2, name = $3, role_id = $4, tenant_id = $5, updated_at = $6 WHERE id = $7 RETURNING *;';
        const params = [user.email, user.username, user.name, user.role.id, user.tenant.id, new Date(), user.id];
        const result = await this.databaseService.query(query, params);

        if (result.length == 0)
            return null;

        return user;
    }

    async updatePassword(user: User, password: string): Promise<boolean> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'UPDATE users SET password = $1, updated_at = $2 WHERE id = $3 RETURNING *;';
        const params = [hashedPassword, new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async deactivate(user: User): Promise<boolean> {
        const query = 'UPDATE users SET active = false, updated_at = $1 WHERE id = $2 RETURNING *;';
        const params = [new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async clearPasswordResetToken(user: User): Promise<boolean> {
        const query = 'UPDATE users SET change_password_token = NULL, updated_at = $1 WHERE id = $2 RETURNING *;';
        const params = [new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }

    async changePassword(user: User, newPassword: string): Promise<boolean> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query = "UPDATE users SET password = $1, updated_at = $2 WHERE id = $3 RETURNING *;";
        const params = [hashedPassword, new Date(), user.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }
}
