import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { Tenant } from 'src/entities/tenant.entity';

@Injectable()
export class TenantsService {
    constructor(private databaseService: DatabaseService) { }

    async create(name: string, email: string, address: string): Promise<Tenant | null> {
        const query = 'INSERT INTO tenants (name, address, email) VALUES ($1, $2, $3) RETURNING *;';
        const params = [name, address, email];

        const result = await this.databaseService.query(query, params);

        if (result.length == 0)
            return null;

        const tenant: Tenant = {
            id: result[0].id,
            name: result[0].name,
            email: result[0].email,
            address: result[0].address,
            active: result[0].active,
            createdAt: result[0].createdAt,
            updatedAt: result[0].updatedAt
        };

        return tenant;
    }

    async findAll(): Promise<Tenant[]> {
        const query = "SELECT * FROM tenants;";
        const result = await this.databaseService.query(query);

        if (result.length == 0)
            return null;

        const tenants: Tenant[] = result.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            address: row.address,
            active: row.active,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }));

        return tenants;
    }

    async findOne(tenantId: number): Promise<Tenant | null> {
        const query = 'SELECT * FROM tenants WHERE id = $1;';
        const result = await this.databaseService.query(query, [tenantId]);

        if (result.length == 0)
            return null;

        const tenant: Tenant = {
            id: result[0].id,
            name: result[0].name,
            email: result[0].email,
            address: result[0].address,
            active: result[0].active,
            createdAt: result[0].createdAt,
            updatedAt: result[0].updatedAt
        };

        return tenant;
    }

    async findMany(tenantIds: number[]): Promise<Tenant[] | null> {
        const query = 'SELECT * FROM tenants WHERE id IN ($1);';
        const result = await this.databaseService.query(query, [tenantIds]);

        if (result.length == 0)
            return null;

        const tenants: Tenant[] = result.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            address: row.address,
            active: row.active,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }));

        return tenants;
    }

    async update(tenant: Tenant): Promise<Tenant | null> {
        const query = 'UPDATE tenants SET name = $1, email = $2, address = $3, updated_at = $4 WHERE id = $5 RETURNING *;';
        const params = [tenant.name, tenant.email, tenant.address, new Date(), tenant.id];
        const result = await this.databaseService.query(query, params);

        if (result.length == 0)
            return null;

        return tenant;
    }

    async deactivate(tenant: Tenant): Promise<boolean> {
        const query = 'UPDATE tenants SET active = false, updated_at = $1 WHERE id = $2 RETURNING *;';
        const params = [new Date(), tenant.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }
}
