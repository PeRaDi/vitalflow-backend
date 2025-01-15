import { Body, Controller, HttpStatus, Post, Request, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import ErrorResponse from 'src/responses/error-response';
import { User } from 'src/entities/user.entity';
import Response from 'src/responses/response';
import { InviteUserDto } from './dto/invite-user.dto';
import { Tenant } from 'src/entities/tenant.entity';
import { TenantsService } from 'src/tenants/tenants.service';
import { Role } from 'src/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Controller('admin')
export class AdminController {

    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly tenantsService: TenantsService,
        private readonly rolesService: RolesService) { }

    @Post('invite')
    async inviteUser(@Res() res, @Request() req, @Body() inviteUserDto: InviteUserDto) {
        try {
            const user: User = req.user;

            const emailUser: User = await this.usersService.findByEmail(inviteUserDto.email);
            if (emailUser)
                return new ErrorResponse("There's already an user with this email.", HttpStatus.BAD_REQUEST).toThrowException();

            const tenant: Tenant = await this.tenantsService.findOne(inviteUserDto.tenantId);
            if (!tenant)
                return new ErrorResponse("Tenant not found.", HttpStatus.BAD_REQUEST).toThrowException();

            const role: Role = await this.rolesService.findOneById(inviteUserDto.roleId);
            if (!role)
                return new ErrorResponse("Role not found.", HttpStatus.BAD_REQUEST).toThrowException();

            await this.authService.deleteSignupTokens(inviteUserDto.email);

            await this.adminService.inviteUser(user, inviteUserDto.email, tenant, role);
            return new Response(res, "User successfully invited.", HttpStatus.OK).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while inviting a new user.", error).toThrowException();
        }
    }
}
