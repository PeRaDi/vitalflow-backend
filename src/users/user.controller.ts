import {
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Request,
    Res,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('info')
    async info(@Res() res, @Request() req) {
        try {
            const user: User = req.user;

            return new Response(
                res,
                'Successfully retrieved personal user information.',
                HttpStatus.OK,
                user,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred.',
                error,
            ).toThrowException();
        }
    }

    @Patch(':user_id/deactivate')
    @Roles('manager')
    async deactivate(
        @Res() res,
        @Request() req,
        @Param('user_id') userIdParam: string,
    ) {
        try {
            const user: User = req.user;
            const userToDeactivate: User = await this.usersService.findOne(
                Number(userIdParam),
            );

            if (userToDeactivate.id === user.id)
                return new ErrorResponse(
                    'You cannot deactivate your own user.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (!userToDeactivate)
                return new ErrorResponse(
                    'User not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                (user.tenant.id !== userToDeactivate.tenant.id ||
                    user.role.level < userToDeactivate.role.level)
            )
                return new ErrorResponse(
                    'You are not authorized to deactivate this user.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            const status = await this.usersService.deactivate(userToDeactivate);
            if (!status)
                return new ErrorResponse(
                    'An error occurred while deactivating the user.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ).toThrowException();

            return new Response(
                res,
                'User successfully deactivated.',
                HttpStatus.OK,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while deactivating the user.',
                error,
            ).toThrowException();
        }
    }

    @Patch(':user_id/activate')
    @Roles('manager')
    async activate(
        @Res() res,
        @Request() req,
        @Param('user_id') userIdParam: string,
    ) {
        try {
            const user: User = req.user;
            const userToActivate: User = await this.usersService.findOne(
                Number(userIdParam),
            );

            if (userToActivate.id === user.id)
                return new ErrorResponse(
                    'You cannot activate your own user.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (!userToActivate)
                return new ErrorResponse(
                    'User not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                (user.tenant.id !== userToActivate.tenant.id ||
                    user.role.level < userToActivate.role.level)
            )
                return new ErrorResponse(
                    'You are not authorized to activate this user.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            const status = await this.usersService.activate(userToActivate);
            if (!status)
                return new ErrorResponse(
                    'An error occurred while activating the user.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ).toThrowException();

            return new Response(
                res,
                'User successfully activated.',
                HttpStatus.OK,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while activating the user.',
                error,
            ).toThrowException();
        }
    }
}
