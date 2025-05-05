import { HttpStatus } from '@nestjs/common';

export default class Response {
    response: any;
    message: string;
    type: HttpStatus;
    data?: any;
    authCookie?: any;

    constructor(
        response: any,
        message: string,
        type: HttpStatus,
        data?: any,
        authCookie?: any,
    ) {
        this.response = response;
        this.message = message;
        this.type = type;
        this.data = data;
        this.authCookie = authCookie;
    }

    toHttpResponse() {
        if (this.authCookie) {
            return this.response
                .cookie('access_token', this.authCookie, {
                    httpOnly: true,
                    secure: 'true',
                    sameSite: 'none',
                    path: '/',
                    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                })
                .status(this.type)
                .json({
                    message: this.message,
                    data: this.data,
                });
        } else {
            return this.response.status(this.type).json({
                message: this.message,
                data: this.data,
            });
        }
    }
}
