import { Controller, Request, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import Response from 'src/responses/response';
import ErrorResponse from 'src/responses/error-response';
import { UsersService } from 'src/users/users.service';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { AuthService } from './auth.service';
import { MailService } from 'src/mail/mail.service';
import { Public } from './auth.decorator';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {
    constructor(private usersService: UsersService, private authService: AuthService, private mailService: MailService) { }

    @Public()
    @Post("signup")
    async signup(@Res() res, @Body() signupDto: SignupDto) {
        const user = await this.usersService.findByEmail(signupDto.email) || await this.usersService.findByUsername(signupDto.username);

        if (user)
            return new ErrorResponse("User already exists.", HttpStatus.CONFLICT).toThrowException();

        if (signupDto.password !== signupDto.confirmPassword)
            return new ErrorResponse("Passwords do not match.", HttpStatus.BAD_REQUEST).toThrowException();

        const signupToken = await this.authService.findSignupToken(signupDto.signupToken);

        if (!signupToken)
            return new ErrorResponse("Invalid signup token.", HttpStatus.UNAUTHORIZED).toThrowException();

        try {
            const user = await this.authService.signup(signupDto.email, signupDto.username, signupDto.name, signupDto.password, signupToken);
            await this.mailService.sendWelcomeEmail(user);

            const data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
            };

            await this.authService.deleteSignupTokens(user.email);

            return new Response(res, "Successfully signed up.", HttpStatus.CREATED, data).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while signing up.", error).toThrowException();
        }
    }

    @Public()
    @Post('signin')
    async signin(@Res() res, @Request() req, @Body() signinDto: SigninDto) {
        try {
            const user = await this.usersService.findByEmail(signinDto.emailOrUsername) || await this.usersService.findByUsername(signinDto.emailOrUsername);

            if (!user)
                return new ErrorResponse("Unauthorized.", HttpStatus.UNAUTHORIZED).toThrowException();

            if (!bcrypt.compare(signinDto.password, user.password))
                return new ErrorResponse("Unauthorized.", HttpStatus.UNAUTHORIZED).toThrowException();

            const token = await this.authService.signin(user);
            return new Response(res, "Successfully signed in.", HttpStatus.OK, { token }).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while signing in.", error).toThrowException();
        }
    }

    @Post('signout')
    async signout(@Res() res, @Request() req) {
        try {
            const user: User = req.user;
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];

            await this.authService.signout(user, token);
            return new Response(res, "Successfully signed out.", HttpStatus.OK).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while signing out.", error).toThrowException();
        }
    }

    @Public()
    @Post("forgotPassword")
    async forgotPassword(@Res() res, @Body() forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.usersService.findByEmail(forgotPasswordDto.emailOrUsername) || await this.usersService.findByUsername(forgotPasswordDto.emailOrUsername);
        if (!user)
            return new ErrorResponse("User does not exist.", HttpStatus.BAD_REQUEST).toThrowException();

        try {
            const status = await this.authService.forgotPassword(user);
            return new Response(res, "Successfully sent password reset code.", HttpStatus.OK, status).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while sending password reset code.", error).toThrowException();
        }
    }

    @Public()
    @Post("resetPassword")
    async resetPassword(@Res() res, @Body() resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.findByEmail(resetPasswordDto.emailOrUsername) || await this.usersService.findByUsername(resetPasswordDto.emailOrUsername);

        if (!user)
            return new ErrorResponse("User does not exist.", HttpStatus.BAD_REQUEST).toThrowException();

        if (resetPasswordDto.password !== resetPasswordDto.confirmPassword)
            return new ErrorResponse("Passwords do not match.", HttpStatus.BAD_REQUEST).toThrowException();

        if (user.changePasswordTokenExpiry < new Date()) {
            await this.usersService.clearPasswordResetToken(user);
            return new ErrorResponse("Token has expired.", HttpStatus.BAD_REQUEST).toThrowException();
        }

        if (user.changePasswordToken !== resetPasswordDto.forgotPasswordToken)
            return new ErrorResponse("Invalid token.", HttpStatus.BAD_REQUEST).toThrowException();

        try {
            await this.usersService.changePassword(user, resetPasswordDto.password);
            await this.usersService.clearPasswordResetToken(user);

            await this.mailService.sendChangePasswordConfirmation(user);

            return new Response(res, "Successfully reset password.", HttpStatus.OK).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while resetting password.", error).toThrowException();
        }
    }
}
