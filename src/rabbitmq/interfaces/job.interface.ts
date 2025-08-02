import { UUID } from 'crypto';
import { JobStatus } from '../types/job-status.enum';

export interface Job {
    id: UUID;
    itemId: number;
    queue: 'TRAINER' | 'FORECASTER';
    status: JobStatus;
    createdAt: Date;
    modifiedAt: Date;
    result: object | null;
}
