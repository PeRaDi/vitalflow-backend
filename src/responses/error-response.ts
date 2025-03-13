import { HttpException } from '@nestjs/common';

export default class ErrorResponse {
    message: object;
    errorType: number;

    constructor(message: string, error: any) {
        this.message = { message };
        this.errorType = error;
        error && console.error(error);
    }

    toThrowException() {
        throw new HttpException(this.message, this.errorType);
    }
}
