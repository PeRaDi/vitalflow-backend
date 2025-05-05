import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { Item } from 'src/entities/item.entity';
import { CriticalityLevel } from 'src/utils/types';

@Injectable()
export class ItemsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(tenantId: number): Promise<Item[] | null> {
        const result = await this.databaseService.query(
            'SELECT * FROM items WHERE tenant_id = $1',
            [tenantId],
        );

        return result.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            tenantId: row.tenant_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criticality: row.criticality,
        }));
    }

    async findOne(id: number): Promise<Item | null> {
        const result = await this.databaseService.query(
            'SELECT * FROM items WHERE id = $1',
            [id],
        );

        if (result.length == 0) return null;

        const row = result[0];

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            tenantId: row.tenant_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criticality: row.criticality,
        };
    }

    async create(
        tenantId: number,
        name: string,
        description: string,
        criticality: CriticalityLevel,
    ): Promise<Item> {
        const result = await this.databaseService.query(
            'INSERT INTO items (name, description, tenant_id, criticality) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, tenantId, criticality],
        );

        const row = result[0];

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            tenantId: row.tenant_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criticality: row.criticality,
        };
    }
}
