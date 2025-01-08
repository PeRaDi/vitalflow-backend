import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService
    ) {}

    async validateUserWithUsername(username: string, password: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (user && bcrypt.compareSync(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async validateUserWithEmail(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && bcrypt.compareSync(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async signup(email: string, username: string, password: string) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        return this.usersService.create(email, username, hashedPassword);
    }

    async signin(emailOrUsername: string, userIp: string) {
        const user = await this.usersService.findByEmail(emailOrUsername) || await this.usersService.findByUsername(emailOrUsername);
        const token = await this.prisma.userAuthTokens.findFirst({
            where: {
                userId: user.id,
                ip: userIp
            }
        }).then(token => token?.token);

        if (token) {
            try {
                await this.jwtService.verifyAsync(token);
                return {
                    token: token,
                };
            } catch (error) {
                return this.generateToken(user, userIp);
            }
        } else {
            return this.generateToken(user, userIp);
        }
    }

    async generateToken(user: User, userIp: string) {
        try {
            const payload = {
                username: user.username,
                sub: user.id,
                timestamp: new Date().toISOString()
            };

            const token = await this.jwtService.signAsync(payload);
            this.registerToken(user.id, token, userIp);

            return {
                access_token: token,
            };
        } catch (error) {
            throw new UnauthorizedException('Error generating token.');
        }
    }

    async registerToken(userId: number, token: string, userIp: string) {
        return this.prisma.userAuthTokens.create({
            data: {
                userId: userId,
                token: token,
                ip: userIp
            }
        });
    }

    async logout(token: string) {
        const existsToken = await this.prisma.userAuthTokens.findFirst({
            where: {
                token: token
            }
        });

        if (!existsToken) {
            throw new UnauthorizedException('Token does not exist.');
        }
        
        return await this.prisma.userAuthTokens.delete({
            where: {
                token: token
            }
        });
    }

    async clearAuthTokens(userId: number) {
        return this.prisma.userAuthTokens.deleteMany({
            where: {
                userId: userId
            }
        });
    }

    async forgotPassword(user: User) {
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.changePasswordToken = token;
        user.changePasswordTokenExpiry = new Date(Date.now() + 300000);
        await this.usersService.update(user);

        await this.mailService.sendForgotPasswordToken(user, token);
    }
}
