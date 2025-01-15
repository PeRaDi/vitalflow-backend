import { Role } from "src/entities/role.entity";
import { DatabaseService } from "./database.service";
import { UsersService } from "src/users/users.service";

export async function initDb(dbService: DatabaseService, usersService: UsersService, env: NodeJS.ProcessEnv): Promise<boolean> {
    const query = 'SELECT * FROM users WHERE username = $1 AND email = $2';
    const result = await dbService.query(query, [env.ADMIN_USERNAME, env.ADMIN_EMAIL]);
    if (result.length === 0) {
        const rolesQuery = `
            INSERT INTO roles (display_name, label, level) 
                VALUES 
                    ($1, $2, $3), 
                    ($4, $5, $6), 
                    ($7, $8, $9) 
                RETURNING *;
            `;

        await dbService.query(rolesQuery, [
            'Administrator', 'ADMIN', '0',
            'User', 'USER', '1',
            'Manager', 'MANAGER', '2'
        ]);

        await usersService.createAdmin(env.ADMIN_EMAIL, env.ADMIN_USERNAME, env.ADMIN_PASSWORD, env.ADMIN_NAME);

        const measureUnitsQuery = `
        INSERT INTO item_measure_units (name, abbreviation, conversion_factor, is_length, is_mass, is_volume, is_units) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7), 
            ($8, $9, $10, $11, $12, $13, $14),
            ($15, $16, $17, $18, $19, $20, $21),
            ($22, $23, $24, $25, $26, $27, $28),
            ($29, $30, $31, $32, $33, $34, $35), 
            ($36, $37, $38, $39, $40, $41, $42),
            ($43, $44, $45, $46, $47, $48, $49),
            ($50, $51, $52, $53, $54, $55, $56),
            ($57, $58, $59, $60, $61, $62, $63);
        `;
        await dbService.query(measureUnitsQuery, [
            'Meter', 'm', '1', 'true', 'false', 'false', 'false',
            'Centimeter', 'cm', '0.01', 'true', 'false', 'false', 'false',
            'Kilometer', 'km', '1000', 'true', 'false', 'false', 'false',
            'Liter', 'L', '1', 'false', 'false', 'true', 'false',
            'Milliliter', 'mL', '0.001', 'false', 'false', 'true', 'false',
            'Gram', 'g', '1', 'false', 'true', 'false', 'false',
            'Kilogram', 'kg', '1000', 'false', 'true', 'false', 'false',
            'Units', 'unit(s)', '1', 'false', 'false', 'false', 'true',
            'Cubic Meter', 'm³', '1', 'false', 'false', 'true', 'false',
        ]);

        const transactionTypesQuery = "INSERT INTO transaction_types (label) VALUES ($1), ($2);";
        await dbService.query(transactionTypesQuery, ['IN', 'OUT']);

        return true;
    } else {
        return false;
    }
}