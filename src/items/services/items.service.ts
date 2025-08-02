import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { Item } from 'src/entities/item.entity';
import { CriticalityLevel } from 'src/utils/types';

@Injectable()
export class ItemsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(tenantId?: number): Promise<Item[] | null> {
        let query = 'SELECT * FROM items';
        const params: any[] = [];
        if (tenantId) {
            query += ' WHERE tenant_id = $1';
            params.push(tenantId);
        }
        const result = await this.databaseService.query(query, params);

        return result.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            frequentOrder: row.frequent_order,
            leadTime: row.lead_time,
            tenantId: row.tenant_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criticality: row.criticality,
            active: row.active,
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
            frequentOrder: row.frequent_order,
            leadTime: row.lead_time,
            tenantId: row.tenant_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criticality: row.criticality,
            active: row.active,
        };
    }

    async create(
        tenantId: number,
        name: string,
        description: string,
        criticality: CriticalityLevel,
        frequentOrder: boolean,
        leadTime: number,
    ): Promise<Item> {
        console.log(
            `Creating item: ${name}, Description: ${description}, Criticality: ${criticality}, Frequent Order: ${frequentOrder}, Lead Time: ${leadTime}`,
        );
        const result = await this.databaseService.query(
            'INSERT INTO items (name, description, tenant_id, frequent_order, criticality, lead_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, tenantId, frequentOrder, criticality, leadTime],
        );

        const row = result[0];

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            frequentOrder: row.frequent_order,
            leadTime: row.lead_time,
            tenantId: row.tenant_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criticality: row.criticality,
            active: row.active,
        };
    }

    async update(
        tenantId: number,
        id: number,
        name: string,
        description: string,
        frequentOrder: boolean,
        criticality: CriticalityLevel,
        leadTime: number,
    ): Promise<Item> {
        const result = await this.databaseService.query(
            'UPDATE items SET name = $1, description = $2, frequent_order = $3, criticality = $4, lead_time = $5 WHERE id = $6 AND tenant_id = $7 RETURNING *',
            [
                name,
                description,
                frequentOrder,
                criticality,
                leadTime,
                id,
                tenantId,
            ],
        );

        const row = result[0];

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            leadTime: row.lead_time,
            frequentOrder: row.frequent_order,
            tenantId: row.tenant_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criticality: row.criticality,
            active: row.active,
        };
    }

    async toggle(item: Item): Promise<boolean> {
        const query =
            'UPDATE items SET active = NOT active, updated_at = $1 WHERE id = $2 RETURNING *';
        const params = [new Date(), item.id];

        const result = await this.databaseService.query(query, params);
        return result.length > 0;
    }
}
