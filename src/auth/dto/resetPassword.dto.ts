import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty()
    emailOrUsername: string;

    @ApiProperty()
    forgotPasswordToken: number;

    @ApiProperty()
    password: string;

    @ApiProperty()
    confirmPassword: string;
}
