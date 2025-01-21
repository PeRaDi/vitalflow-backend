import { TenantContact } from './tenant-contact.entity';

export interface Tenant {
    id: number;
    name: string;
    address: string;
    email: string;
    active: boolean;
    contacts?: TenantContact[];
    createdAt: Date;
    updatedAt: Date;
}
