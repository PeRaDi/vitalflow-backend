import { HttpStatus } from '@nestjs/common';

export default class BenignErrorResponse {
    response: any;
    message: string;
    type: HttpStatus;
    data?: any;

    constructor(response: any, message: string, type: HttpStatus, data?: any) {
        this.response = response;
        this.message = message;
        this.type = type;
        this.data = data;
    }

    toHttpResponse() {
        return this.response.status(this.type).json({
            message: this.message,
            data: this.data,
        });
    }
}
