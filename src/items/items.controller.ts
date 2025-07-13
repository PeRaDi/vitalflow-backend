import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Request,
    Res,
} from '@nestjs/common';
import { Item } from 'src/entities/item.entity';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}

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
    //#endregion

    //#region PUT
    @Put(':id')
    @Roles('manager')
    async update(
        @Res() res,
        @Request() req,
        @Param('id') itemId: number,
        @Body() updateItemDto: UpdateItemDto,
    ) {
        try {
            const user = req.user;
            const item = await this.itemsService.update(
                user.tenant.id,
                itemId,
                updateItemDto.name,
                updateItemDto.description,
                updateItemDto.criticality,
            );

            return new Response(
                res,
                'Item successfully updated.',
                HttpStatus.OK,
                item,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while updating the item.',
                error,
            ).toThrowException();
        }
    }
    //#endregion

    //#region PATCH
    @Patch(':item_id/toggle')
    @Roles('manager')
    async toggleItem(
        @Res() res,
        @Request() req,
        @Param('item_id') itemIdParam: number,
    ) {
        try {
            const user = req.user;
            const itemToToggle: Item =
                await this.itemsService.findOne(itemIdParam);

            if (!itemToToggle) {
                return new ErrorResponse(
                    'Item not found.',
                    HttpStatus.NOT_FOUND,
                ).toThrowException();
            }

            if (itemToToggle.tenantId !== user.tenant.id) {
                return new ErrorResponse(
                    'You do not have permission to toggle this item.',
                    HttpStatus.FORBIDDEN,
                ).toThrowException();
            }

            const status = await this.itemsService.toggle(itemToToggle);
            if (!status) {
                return new ErrorResponse(
                    'An error occurred while toggling the item.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ).toThrowException();
            }
            const updatedItem = await this.itemsService.findOne(itemIdParam);
            return new Response(
                res,
                'Item successfully toggled.',
                HttpStatus.OK,
                updatedItem,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while toggling the item.',
                error,
            ).toThrowException();
        }
    }
    //#endregion
}
