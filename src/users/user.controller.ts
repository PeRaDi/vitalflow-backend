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
import BenignErrorResponse from 'src/responses/benign-error-response';
import ErrorResponse from 'src/responses/error-response';
import Response from 'src/responses/response';
import { Roles } from 'src/roles/roles.decorator';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) {}

    //#region GET

    @Get('info')
    @Roles('user')
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

    //#endregion

    //#region PATCH

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
                return new BenignErrorResponse(
                    res,
                    'You cannot toggle your own user.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (!userToToggle)
                return new BenignErrorResponse(
                    res,
                    'User not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label.toLowerCase() !== 'admin' &&
                (user.tenant.id !== userToToggle.tenant.id ||
                    user.role.level < userToToggle.role.level)
            )
                return new BenignErrorResponse(
                    res,
                    'You are not authorized to toggle this user.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            const status = await this.usersService.toggle(userToToggle);
            if (!status)
                new ErrorResponse(
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

    @Patch(':user_id/role/:role')
    @Roles('manager')
    async changeRole(
        @Res() res,
        @Request() req,
        @Param('user_id') userIdParam: number,
        @Param('role') roleParam: any,
    ) {
        try {
            const user: User = req.user;
            let userToChangeRole: User =
                await this.usersService.findOne(userIdParam);

            if (!userToChangeRole)
                return new BenignErrorResponse(
                    res,
                    'User not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (userToChangeRole.id === user.id)
                return new BenignErrorResponse(
                    res,
                    'You cannot change your own role.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                user.role.label !== 'ADMIN' &&
                (user.tenant.id !== userToChangeRole.tenant.id ||
                    user.role.level < userToChangeRole.role.level)
            )
                return new BenignErrorResponse(
                    res,
                    "You are not authorized to change this user's role.",
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();

            let role;
            if (isNaN(Number.parseInt(roleParam)))
                role = await this.rolesService.findOneByLabel(roleParam);
            else role = await this.rolesService.findOneById(roleParam);

            if (!role)
                return new BenignErrorResponse(
                    res,
                    'Role not found.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            if (
                role.level > user.role.level ||
                (role.level === 0 && user.role.level !== 0)
            )
                return new BenignErrorResponse(
                    res,
                    'You cannot change the user to a role with a higher level than yours.',
                    HttpStatus.BAD_REQUEST,
                ).toHttpResponse();

            userToChangeRole.role = role;

            const status = await this.usersService.update(userToChangeRole);

            if (!status)
                new ErrorResponse(
                    "An error occurred while changing the user's role.",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ).toThrowException();

            return new Response(
                res,
                "User's role successfully changed.",
                HttpStatus.OK,
                { role: userToChangeRole.role },
            ).toHttpResponse();
        } catch (error) {
            return new ErrorResponse(
                "An error occurred while changing the user's role.",
                error,
            ).toThrowException();
        }
    }

    //#endregion
}
