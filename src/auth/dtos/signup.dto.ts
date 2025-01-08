import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    confirmPassword: string;
};