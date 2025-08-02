import { CriticalityLevel } from 'src/utils/types';

export interface Item {
    id: number;
    name: string;
    description: string;
    frequentOrder: boolean;
    leadTime: number;
    tenantId: number;
    createdAt: Date;
    updatedAt: Date;
    criticality: CriticalityLevel;
    active: boolean;
}
