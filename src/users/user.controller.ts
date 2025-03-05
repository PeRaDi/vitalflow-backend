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

    @Patch(':user_id/toggle')
    @Roles('manager')
    async toggle(
        @Res() res,
        @Request() req,
        @Param('user_id') userIdParam: number,
    ) {
        try {
            const user: User = req.user;
            let userToToggle: User =
                await this.usersService.findOne(userIdParam);

            if (userToToggle.id === user.id)
                return new ErrorResponse(
                    'You cannot toggle your own user.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (!userToToggle)
                return new ErrorResponse(
                    'User not found.',
                    HttpStatus.BAD_REQUEST,
                ).toThrowException();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                (user.tenant.id !== userToToggle.tenant.id ||
                    user.role.level < userToToggle.role.level)
            )
                return new ErrorResponse(
                    'You are not authorized to toggle this user.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();

            const status = await this.usersService.toggle(userToToggle);
            if (!status)
                return new ErrorResponse(
                    'An error occurred while toggling the user.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ).toThrowException();

            userToToggle = await this.usersService.findOne(userIdParam);

            return new Response(
                res,
                'User successfully toggled.',
                HttpStatus.OK,
                { active: userToToggle.active },
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred while toggling the user.',
                error,
            ).toThrowException();
        }
    }

    @Get()
    @Roles('admin')
    async findAll(@Res() res) {
        try {
            const users: User[] = await this.usersService.findAll();

            return new Response(
                res,
                'Successfully retrieved all users.',
                HttpStatus.OK,
                users,
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                'An error occurred.',
                error,
            ).toThrowException();
        }
    }
}
