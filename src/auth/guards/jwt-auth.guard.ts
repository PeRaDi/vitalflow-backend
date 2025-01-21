import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
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
        const token = this.extractTokenFromHeader(req);

        if (!token) {
            throw new ErrorResponse(
                'Invalid authentication token.',
                HttpStatus.UNAUTHORIZED,
            ).toThrowException();
        }
        const secretPayload = {
            secret: this.configService.get('JWT_SECRET'),
        };

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                secretPayload,
            );
            const user = await this.userService.findOne(payload.sub);

            req['user'] = user;
        } catch {
            throw new ErrorResponse(
                'Invalid authentication token.',
                HttpStatus.UNAUTHORIZED,
            ).toThrowException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
