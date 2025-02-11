import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import ErrorResponse from 'src/responses/error-response';
import { UsersService } from 'src/users/users.service';
import { IS_PUBLIC_KEY } from '../auth.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UsersService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) return true;

        const req = context.switchToHttp().getRequest();

        if (!req.headers.cookie) {
            throw new ErrorResponse(
                'Invalid authentication token.',
                HttpStatus.UNAUTHORIZED,
            ).toThrowException();
        }

        const token = req.headers.cookie.split('=')[1];
        req.headers.authorization = `Bearer ${token}`;

        const secretPayload = {
            secret: this.configService.get('JWT_SECRET'),
        };

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                secretPayload,
            );
            const user = await this.userService.findOne(payload.sub);

            if (!user) {
                throw new ErrorResponse(
                    'Invalid authentication token.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();
            }

            req['user'] = user;
        } catch (error) {
            if (
                error instanceof TokenExpiredError &&
                req.route.path !== '/auth/signout'
            ) {
                throw new ErrorResponse(
                    'Token expired.',
                    HttpStatus.UNAUTHORIZED,
                ).toThrowException();
            }

            if (
                error instanceof TokenExpiredError &&
                req.route.path === '/auth/signout'
            ) {
                req['user'] = 'expired';
                return true;
            }

            throw new ErrorResponse(
                'Invalid authentication token.',
                HttpStatus.UNAUTHORIZED,
            ).toThrowException();
        }
        return true;
    }
}
