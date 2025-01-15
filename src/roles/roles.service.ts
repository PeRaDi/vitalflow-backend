import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { Role } from 'src/entities/role.entity';

@Injectable()
export class RolesService {
    constructor(private readonly databaseService: DatabaseService) { }

    async findAll(): Promise<Role[]> {
        const query = "SELECT * FROM roles;";
        const result = await this.databaseService.query(query);

        if (result.length == 0)
            return null;

        const roles: Role[] = result.map(row => ({
            id: row.id,
            display_name: row.display_name,
            label: row.label,
            level: row.level,
            createdAt: row.created_at,
            updatedAt: row.created_at
        }));

        return roles;
    }

    async findOneById(roleId: number): Promise<Role | null> {
        const query = 'SELECT * FROM roles WHERE id = $1;';
        const result = await this.databaseService.query(query, [roleId]);

        if (result.length == 0)
            return null;

        const role: Role = {
            id: result[0].id,
            display_name: result[0].display_name,
            label: result[0].label,
            level: result[0].level,
            createdAt: result[0].created_at,
            updatedAt: result[0].created_at
        };

        return role;
    }

    async findOneByLabel(label: string): Promise<Role | null> {
        const query = 'SELECT * FROM roles WHERE label = $1;';
        const result = await this.databaseService.query(query, [label]);

        if (result.length == 0)
            return null;

        const role: Role = {
            id: result[0].id,
            display_name: result[0].display_name,
            label: result[0].label,
            level: result[0].level,
            createdAt: result[0].created_at,
            updatedAt: result[0].created_at
        };

        return role;
    }
}
