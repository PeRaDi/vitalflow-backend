import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
    @ApiProperty()
    emailOrUsername: string;

    @ApiProperty()
    password: string;
}
