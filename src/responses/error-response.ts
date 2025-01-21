import { HttpException, HttpStatus } from '@nestjs/common';

export default class ErrorResponse {
    errorMessage: object;
    errorType: number;

    constructor(message: string, error: any | HttpStatus) {
        if (typeof error === 'number') {
            this.errorMessage = {
                message: message,
            };
            this.errorType = error;
        } else {
            this.errorMessage = {
                error: error.name,
                message: message,
                errorMessage: error.message,
            };
            if (error.status === undefined)
                this.errorType = HttpStatus.INTERNAL_SERVER_ERROR;
            else this.errorType = error.status;
        }
    }

    toThrowException() {
        throw new HttpException(this.errorMessage, this.errorType);
    }
}
