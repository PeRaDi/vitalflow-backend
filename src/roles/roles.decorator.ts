import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roleLabels: string[]) => {
    return SetMetadata(ROLES_KEY, roleLabels);
};
