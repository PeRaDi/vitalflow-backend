import { Controller, Request, Post, UseGuards, Body, HttpStatus, Res } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { SigninDto } from './dtos/signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import Response from 'src/responses/response';
import ErrorResponse from 'src/responses/error-response';
import { UsersService } from 'src/users/users.service';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';
import { ResetPasswordDto } from './dtos/resetPassword.dto';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
    constructor(private usersService: UsersService, private authService: AuthService, private mailService: MailService) { }

    @Post("signup")
    async signUp(@Res() res, @Body() signupDto: SignupDto) {
        const user = await this.usersService.findByEmail(signupDto.email) || await this.usersService.findByUsername(signupDto.username);
        if (user)
            return new ErrorResponse("User already exists.", HttpStatus.CONFLICT).toThrowException();

        if(signupDto.password !== signupDto.confirmPassword)
            return new ErrorResponse("Passwords do not match.", HttpStatus.BAD_REQUEST).toThrowException();

        try {
            const user = await this.authService.signup(signupDto.email, signupDto.username, signupDto.password);
            this.mailService.sendWelcomeEmail(user);
            const data = {
                "email": user.email,
                "username": user.username,
                "id": user.id,
            }
            return new Response(res, "Successfully signed up.", HttpStatus.CREATED, data).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while signing up.", error).toThrowException();
        }
    }

    @UseGuards(LocalAuthGuard)
    @Post('signin')
    async signIn(@Res() res, @Request() req, @Body() signinDto: SigninDto) {
        try {
            const userIp = req.ip;
            const status = await this.authService.signin(signinDto.emailOrUsername, userIp);
            return new Response(res, "Successfully signed in.", HttpStatus.OK, status).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while signing in.", error).toThrowException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('signout')
    async signOut(@Res() res, @Request() req) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];

            await this.authService.logout(token);
            return new Response(res, "Successfully signed out.", HttpStatus.OK).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while signing out.", error).toThrowException();
        }
    }

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

    @Post("resetPassword")
    async resetPassword(@Res() res, @Body() resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.findByEmail(resetPasswordDto.emailOrUsername) || await this.usersService.findByUsername(resetPasswordDto.emailOrUsername);
        
        if (!user)
            return new ErrorResponse("User does not exist.", HttpStatus.BAD_REQUEST).toThrowException();

        if(user.changePasswordTokenExpiry < new Date()){
            await this.usersService.clearPasswordResetToken(user);
            return new ErrorResponse("Token has expired.", HttpStatus.BAD_REQUEST).toThrowException();
        }

        if(resetPasswordDto.password !== resetPasswordDto.confirmPassword)
            return new ErrorResponse("Passwords do not match.", HttpStatus.BAD_REQUEST).toThrowException();

        if(user.changePasswordToken !== resetPasswordDto.forgotPasswordToken)
            return new ErrorResponse("Invalid token.", HttpStatus.BAD_REQUEST).toThrowException();

        try {
            user.password = await bcrypt.hash(resetPasswordDto.password, 10);

            await this.usersService.update(user);
            await this.usersService.clearPasswordResetToken(user);
            await this.authService.clearAuthTokens(user.id);

            await this.mailService.sendChangePasswordConfirmation(user);

            return new Response(res, "Successfully reset password.", HttpStatus.OK).toHttpResponse();
        } catch (error) {
            return new ErrorResponse("An error occurred while resetting password.", error).toThrowException();
        }
    }
}
