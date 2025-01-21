import { Body, Controller, HttpStatus, Post, Request, Res } from '@nestjs/common';
import ErrorResponse from 'src/responses/error-response';
import { UsersService } from 'src/users/users.service';
import { TenantsService } from 'src/tenants/tenants.service';
import { User } from 'src/entities/user.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { Role } from 'src/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly tenantsService: TenantsService,
        private readonly rolesService: RolesService,
    ) { }

    @Post('invite')
    @Roles("manager")
    async inviteUser(@Res() res, @Request() req, @Body() inviteUserDto: InviteUserDto) {
        try {
            const user: User = req.user;

            const emailUser: User = await this.usersService.findByEmail(inviteUserDto.email);
            if (emailUser)
                return new ErrorResponse("There's already an user with this email.", HttpStatus.BAD_REQUEST).toThrowException();

            const role: Role = await this.rolesService.findOneById(inviteUserDto.roleId);

            if (!role)
                return new ErrorResponse("Role not found.", HttpStatus.BAD_REQUEST).toThrowException();

            let tenant: Tenant = user.tenant;

            if (user.role.label.toLowerCase() != "admin") {
                if (inviteUserDto.tenantId)
                    if (inviteUserDto.tenantId != user.tenant.id)
                        return new ErrorResponse("You can't invite a user to another tenant.", HttpStatus.BAD_REQUEST).toThrowException();

                if (role.level > user.role.level || role.level == 0) {
                    return new ErrorResponse("You can't invite a user with a higher role than yours.", HttpStatus.BAD_REQUEST).toThrowException();
                }
            } else {
                if (!inviteUserDto.tenantId)
                    return new ErrorResponse("You must inform the tenant ID.", HttpStatus.BAD_REQUEST).toThrowException();
                else
                    tenant = await this.tenantsService.findOne(inviteUserDto.tenantId);
            }

            if (!tenant)
                return new ErrorResponse("Tenant not found.", HttpStatus.BAD_REQUEST).toThrowException();

            await this.usersService.deleteSignupTokens(inviteUserDto.email);

            await this.usersService.inviteUser(user, inviteUserDto.email, tenant, role);
            return new Response(res, "User successfully invited.", HttpStatus.OK).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while inviting a new user.", error).toThrowException();
        }
    }
}
