import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import BenignErrorResponse from 'src/responses/benign-error-response';
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
        const res = context.switchToHttp().getResponse();

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new BenignErrorResponse(
                res,
                'Invalid authentication token.',
                HttpStatus.UNAUTHORIZED,
            ).toHttpResponse();
        }

        const token = authHeader.split(' ')[1];

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
                return new BenignErrorResponse(
                    res,
                    'Invalid authentication token.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();
            }

            if (user.tenant.id !== null)
                if (!user.tenant.active)
                    return new BenignErrorResponse(
                        res,
                        'This account has been deactivated.',
                        HttpStatus.UNAUTHORIZED,
                    ).toHttpResponse();

            if (!user.active) {
                return new BenignErrorResponse(
                    res,
                    'This account has been deactivated.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();
            }

            req['user'] = user;
        } catch (error) {
            if (
                error instanceof TokenExpiredError &&
                req.route.path !== '/auth/signout'
            ) {
                return new BenignErrorResponse(
                    res,
                    'Token expired.',
                    HttpStatus.UNAUTHORIZED,
                ).toHttpResponse();
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
