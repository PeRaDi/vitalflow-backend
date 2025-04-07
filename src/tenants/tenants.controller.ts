import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Request,
    Res,
} from '@nestjs/common';
import { Role } from 'src/entities/role.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { User } from 'src/entities/user.entity';
import BenignErrorResponse from 'src/responses/benign-error-response';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { AddContactsDto } from './dto/add-contacts.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly tenantsService: TenantsService,
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) {}

    //#region GET
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
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new BenignErrorResponse(
                    res,
                    "You are not authorized to view this tenant's contacts.",
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

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
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to view this tenant users.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

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

    @Get('invites')
    @Roles('manager')
    async getInvites(
        @Res() res,
        @Request() req,
        @Query('tenantId', new DefaultValuePipe(-1), ParseIntPipe)
        tenantId: number,
    ) {
        try {
            const user: User = req.user;

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                (user.tenant.id !== tenantId || tenantId == -1)
            )
                return new BenignErrorResponse(
                    res,
                    'You are only authorized to view your tenant invites.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            if (
                tenantId != -1 &&
                (await this.tenantsService.findOne(tenantId)) == null
            )
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

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

    //#endregion

    //#region POST
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
                return new BenignErrorResponse(
                    res,
                    'An error occurred while creating a new tenant.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ).toHttpResponse();

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
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to invite users in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            const emailUser: User = await this.usersService.findByEmail(
                inviteUserDto.email,
            );
            if (emailUser)
                return new BenignErrorResponse(
                    res,
                    "There's already an user with this email.",
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            const tenant: Tenant = await this.tenantsService.findOne(tenantId);
            if (!tenant)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            const role: Role = await this.rolesService.findOneById(
                inviteUserDto.roleId,
            );
            if (!role)
                return new BenignErrorResponse(
                    res,
                    'Role not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (!tenant)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

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
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to add contacts in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (addContactsDto.contacts.length == 0)
                return new BenignErrorResponse(
                    res,
                    'At least one contact is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

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
                new ErrorResponse(
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
    //#endregion

    //#region PATCH

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
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to update contacts in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (!contactId)
                return new BenignErrorResponse(
                    res,
                    'Contact ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            const contactNumber: number = updateContactDto.contact;
            const contactInfo: string = updateContactDto.info;

            const result = await this.tenantsService.updateContact(
                tenantId,
                contactId,
                contactNumber,
                contactInfo,
            );

            if (!result)
                return new BenignErrorResponse(
                    res,
                    'Specified contact not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

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
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (user.role.label.toLowerCase() !== 'admin')
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to toggle tenants.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            let tenant: Tenant = await this.tenantsService.findOne(tenantId);

            if (tenant == null)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            const result = await this.tenantsService.toggle(tenant);

            if (!result)
                new ErrorResponse(
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
        @Body() updateTenantDto: UpdateTenantDto,
    ) {
        try {
            const user: User = req.user;
            const tenantId = Number(tenantIdParam);

            if (!tenantId)
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (user.role.label.toLowerCase() !== 'admin')
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to update tenants.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            let tenant: Tenant = await this.tenantsService.findOne(tenantId);

            if (tenant == null)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            const updatedTenant: Tenant = {
                ...tenant,
                name: updateTenantDto.name || tenant.name,
                address: updateTenantDto.address || tenant.address,
                email: updateTenantDto.email || tenant.email,
                active: Object.getOwnPropertyNames(updateTenantDto).includes(
                    'active',
                )
                    ? updateTenantDto.active
                    : tenant.active,
            };

            const result = await this.tenantsService.update(updatedTenant);

            if (!result)
                new ErrorResponse(
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
    //#endregion

    //#region DELETE
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
                return new BenignErrorResponse(
                    res,
                    'Tenant ID is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                user.tenant.id !== tenantId
            )
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to delete contacts in this tenant.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            if ((await this.tenantsService.findOne(tenantId)) == null)
                return new BenignErrorResponse(
                    res,
                    'Tenant not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (!contactsIds)
                return new BenignErrorResponse(
                    res,
                    'At least one contact is required.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            const result = await this.tenantsService.deleteContacts(
                tenantId,
                contactsIds,
            );

            if (!result)
                return new BenignErrorResponse(
                    res,
                    'Specified contacts not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

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
    //#endregion
}
