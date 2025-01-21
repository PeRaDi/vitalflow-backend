import { Controller, Post, Body, Res, Request, HttpStatus } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';

@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly tenantsService: TenantsService
    ) { }

    @Post("create")
    @Roles("admin")
    async create(@Res() res, @Request() req, @Body() createTenantDto: CreateTenantDto) {
        try {
            const tenant = await this.tenantsService.create(createTenantDto.name, createTenantDto.email, createTenantDto.address);

            return new Response(res, "Tenant successfully created.", HttpStatus.CREATED, tenant).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while creating a new tenant.", error).toThrowException();
        }
    }
}
