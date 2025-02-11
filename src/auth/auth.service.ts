import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/db/database.service';
import { SignupToken } from 'src/entities/signup-token.entity';
import { User } from 'src/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private databaseService: DatabaseService,
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) {}

    async signup(
        email: string,
        username: string,
        name: string,
        password: string,
        signupToken?: SignupToken,
    ): Promise<User | null> {
        return await this.usersService.create(
            email,
            username,
            password,
            name,
            signupToken,
        );
    }

    async signin(user: User): Promise<string> {
        const payload = {
            sub: user.id,
        };

        return await this.jwtService.signAsync(payload);
    }

    async signout(token: string): Promise<boolean> {
        const query = 'INSERT INTO auth_tokens_blacklist(token) VALUES ($1);';
        await this.databaseService.query(query, [token]);

        return true;
    }

    async forgotPassword(user: User): Promise<boolean> {
        const token = Math.floor(100000 + Math.random() * 900000).toString();

        user.changePasswordToken = token;
        user.changePasswordTokenExpiry = new Date(Date.now() + 300000);
        await this.usersService.update(user);

        await this.mailService.sendForgotPasswordToken(user, token);

        return true;
    }

    async findSignupToken(token: string): Promise<SignupToken | null> {
        const query = 'SELECT * FROM signup_tokens WHERE token = $1;';
        const result = await this.databaseService.query(query, [token]);

        if (result.length === 0) return null;

        const signupToken: SignupToken = {
            id: result[0].id,
            token: result[0].token,
            adminId: result[0].admin_id,
            tenantId: result[0].tenant_id,
            roleId: result[0].role_id,
            email: result[0].user_email,
        };

        return signupToken;
    }
}
