import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendForgotPasswordToken(user: User, token: number) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Forgot Password',
            template: './forgot-password',
            context: {
                name: user.name,
                token: token,
            },
        });
    }

    async sendChangePasswordConfirmation(user: User) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Password Changed',
            template: './changed-password',
            context: {
                name: user.name,
            },
        });
    }

    async sendWelcomeEmail(user: User) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Welcome to vitalFlow',
            template: './account-created',
            context: {
                name: user.name,
            },
        });
    }

    async sendSignupInviteEmail(
        toEmail: string,
        signupUrl: string,
        token: number,
    ) {
        await this.mailerService.sendMail({
            to: toEmail,
            subject: 'Invitation to vitalFlow',
            template: './signup-invite',
            context: {
                token: token,
                signupUrl: signupUrl,
            },
        });
    }
}
