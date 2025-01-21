import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { min } from 'rxjs';
import { Role } from 'src/entities/role.entity';
import { ROLES_KEY } from 'src/roles/roles.decorator';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly rolesService: RolesService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles)
            return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user)
            return false;

        if (user.role.level == 0)
            return true;

        let status = requiredRoles.includes(user.role.label.toString().toLowerCase());

        if (!status) {
            let requiredLevels: number[] = [];
            for (let role of requiredRoles) {
                let roleEntity: Role = await this.rolesService.findOneByLabel(role.toUpperCase());
                requiredLevels.push(roleEntity.level);
            }

            const minLevel = Math.min(...requiredLevels);

            if (minLevel == 0 && user.role.level != 0)
                status = false;
            else if (user.role.level >= minLevel)
                status = true;
        }

        return status;
    }
}