import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Request,
    Res,
} from '@nestjs/common';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { TenantsService } from 'src/tenants/tenants.service';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService,
        private readonly tenantsService: TenantsService,
    ) {}

    //#region GET

    @Get()
    @Roles('user')
    async findAll(@Res() res, @Request() req) {
        try {
            const user = req.user;
            const items = await this.itemsService.findAll(user.tenant.id);

            return new Response(
                res,
                'Items successfully retrieved.',
                HttpStatus.OK,
                items,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while retrieving items.',
                error,
            ).toThrowException();
        }
    }

    //#endregion

    //#region POST
    @Post()
    @Roles('manager')
    async create(
        @Res() res,
        @Request() req,
        @Body() createItemDto: CreateItemDto,
    ) {
        try {
            const user = req.user;
            const item = await this.itemsService.create(
                user.tenant.id,
                createItemDto.name,
                createItemDto.description,
                createItemDto.criticality,
            );

            return new Response(
                res,
                'Item successfully created.',
                HttpStatus.CREATED,
                item,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while creating the item.',
                error,
            ).toThrowException();
        }
    }
}
