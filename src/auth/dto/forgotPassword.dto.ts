import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty()
    emailOrUsername: string;
}
