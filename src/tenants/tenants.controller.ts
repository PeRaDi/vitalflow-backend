import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Request,
    Res,
} from '@nestjs/common';
import { Role } from 'src/entities/role.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { User } from 'src/entities/user.entity';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { AddContactsDto } from './dto/add-contacts.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly tenantsService: TenantsService,
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) {}

    @Get('get')
    @Roles('admin')
    async get(@Res() res) {
        try {
            const tenants = await this.tenantsService.findAll();

            return new Response(
                res,
                'Tenants successfully retrieved.',
                HttpStatus.OK,
                tenants,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving tenants.',
                error,
            ).toThrowException();
        }
    }

    @Post('create')
    @Roles('admin')
    async create(
        @Res() res,
        @Request() req,
        @Body() createTenantDto: CreateTenantDto,
    ) {
        try {
            const tenant = await this.tenantsService.create(
                createTenantDto.name,
                createTenantDto.email,
                createTenantDto.address,
            );

            if (!tenant)
                return new ErrorResponse(
                    'An error occurred while creating a new tenant.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ).toThrowException();

            return new Response(
                res,
                'Tenant successfully created.',
                HttpStatus.CREATED,
                tenant,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while creating a new tenant.',
                error,
            ).toThrowException();
        }
    }

    @Post(':tenant_id/invite')
    @Roles('manager')
    async inviteUser(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
        @Body() inviteUserDto: InviteUserDto,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new ErrorResponse(
                    'You are not authorized to invite users in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            const emailUser: User = await this.usersService.findByEmail(
                inviteUserDto.email,
            );
            if (emailUser)
                return new ErrorResponse(
                    "There's already an user with this email.",
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const tenant: Tenant = await this.tenantsService.findOne(tenantId);
            if (!tenant)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const role: Role = await this.rolesService.findOneById(
                inviteUserDto.roleId,
            );
            if (!role)
                return new ErrorResponse(
                    'Role not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (!tenant)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            await this.usersService.deleteSignupTokens(inviteUserDto.email);

            await this.tenantsService.inviteUser(
                user,
                inviteUserDto.email,
                tenant,
                role,
            );
            return new Response(
                res,
                'User successfully invited.',
                HttpStatus.OK,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while inviting a new user.',
                error,
            ).toThrowException();
        }
    }

    @Get(':tenant_id/contacts')
    async getContacts(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new ErrorResponse(
                    "You are not authorized to view this tenant's contacts.",
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const contacts = await this.tenantsService.getContacts(tenantId);

            return new Response(
                res,
                'Tenant contancts successfully retrieved.',
                HttpStatus.OK,
                contacts,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving tenants.',
                error,
            ).toThrowException();
        }
    }

    @Post(':tenant_id/contacts')
    @Roles('manager')
    async addContacts(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
        @Body() addContactsDto: AddContactsDto,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new ErrorResponse(
                    'You are not authorized to add contacts in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (addContactsDto.contacts.length == 0)
                return new ErrorResponse(
                    'At least one contact is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const contactNumbers: number[] = addContactsDto.contacts.map(
                (contact) => contact.contact,
            );
            const contactInfos: string[] = addContactsDto.contacts.map(
                (contact) => contact.info,
            );

            const result = await this.tenantsService.addContacts(
                tenantId,
                contactNumbers,
                contactInfos,
            );

            if (!result)
                return new ErrorResponse(
                    'An error occurred while adding tenant contacts.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            return new Response(
                res,
                'Tenant contacts successfully added.',
                HttpStatus.CREATED,
                result,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while adding tenant contacts.',
                error,
            ).toThrowException;
        }
    }

    @Delete(':tenant_id/contacts/:contacts_ids')
    @Roles('manager')
    async deleteContacts(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
        @Param('contacts_ids') contactsIdsParam,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);
            const contactsIds = contactsIdsParam
                .split(',')
                .map((contactId) => Number(contactId));

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new ErrorResponse(
                    'You are not authorized to delete contacts in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (!contactsIds)
                return new ErrorResponse(
                    'At least one contact is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const result = await this.tenantsService.deleteContacts(
                tenantId,
                contactsIds,
            );

            if (!result)
                return new ErrorResponse(
                    'Specified contacts not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            return new Response(
                res,
                'Tenant contacts successfully deleted.',
                HttpStatus.OK,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while deleting tenant contacts.',
                error,
            ).toThrowException();
        }
    }

    @Patch(':tenant_id/contacts/:contacts_id/')
    @Roles('manager')
    async updateContact(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
        @Param('contacts_id') contactIdParam,
        @Body() updateContactDto: UpdateContactDto,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);
            const contactId = Number(contactIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new ErrorResponse(
                    'You are not authorized to update contacts in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (!contactId)
                return new ErrorResponse(
                    'Contact ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const contactNumber: number = updateContactDto.contact;
            const contactInfo: string = updateContactDto.info;

            const result = await this.tenantsService.updateContact(
                tenantId,
                contactId,
                contactNumber,
                contactInfo,
            );

            if (!result)
                return new ErrorResponse(
                    'Specified contact not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            return new Response(
                res,
                'Tenant contact successfully updated.',
                HttpStatus.OK,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while updating tenant contact.',
                error,
            ).toThrowException();
        }
    }

    @Patch(':tenant_id/toggle')
    @Roles('admin')
    async toggleTenant(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (user.role.label.toLowerCase() !== 'admin')
                return new ErrorResponse(
                    'You are not authorized to toggle tenants.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            let tenant: Tenant = await this.tenantsService.findOne(tenantId);

            if (tenant == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const result = await this.tenantsService.toggle(tenant);

            if (!result)
                return new ErrorResponse(
                    'An error occurred while toggling tenant.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            tenant = await this.tenantsService.findOne(tenantId);

            return new Response(
                res,
                'Tenant successfully toggled.',
                HttpStatus.OK,
                { active: tenant.active },
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while toggling tenant.',
                error,
            ).toThrowException();
        }
    }

    @Patch(':tenant_id/')
    @Roles('admin')
    async updateTenant(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
        @Body() createTenantDto: CreateTenantDto,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (user.role.label.toLowerCase() !== 'admin')
                return new ErrorResponse(
                    'You are not authorized to update tenants.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            let tenant: Tenant = await this.tenantsService.findOne(tenantId);

            if (tenant == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (createTenantDto.name) tenant.name = createTenantDto.name;
            if (createTenantDto.email) tenant.email = createTenantDto.email;
            if (createTenantDto.address)
                tenant.address = createTenantDto.address;

            const result = await this.tenantsService.update(tenant);

            if (!result)
                return new ErrorResponse(
                    'An error occurred while updating tenant.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            tenant = await this.tenantsService.findOne(tenantId);

            return new Response(
                res,
                'Tenant successfully updated.',
                HttpStatus.OK,
                tenant,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while updating tenant.',
                error,
            ).toThrowException();
        }
    }

    @Get(':tenant_id/users')
    @Roles('manager')
    async getUsers(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new ErrorResponse(
                    'You are not authorized to view this tenant users.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const users = await this.tenantsService.getUsers(tenantId);

            return new Response(
                res,
                'Tenant users successfully retrieved.',
                HttpStatus.OK,
                users,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving tenants.',
                error,
            ).toThrowException();
        }
    }

    @Get(':tenant_id/invites')
    @Roles('manager')
    async getInvites(
        @Res() res,
        @Request() req,
        @Param('tenant_id') tenantIdParam,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new ErrorResponse(
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new ErrorResponse(
                    'You are not authorized to view this tenant invites.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new ErrorResponse(
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            const invites = await this.tenantsService.getInvites(tenantId);

            return new Response(
                res,
                'Tenant invites successfully retrieved.',
                HttpStatus.OK,
                invites,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving tenants.',
                error,
            ).toThrowException();
        }
    }
}
