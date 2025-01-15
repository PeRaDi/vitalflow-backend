import { Role } from "./role.entity";
import { Tenant } from "./tenant.entity";

export interface User {
    id: number;
    email: string;
    username: string;
    name: string;
    password: string;
    changePasswordToken?: string;
    changePasswordTokenExpiry?: Date;
    role?: Role;
    tenant?: Tenant;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}