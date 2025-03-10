import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty()
    currentPassword: string;

    @ApiProperty()
    newPassword: string;

    @ApiProperty()
    confirmNewPassword: string;
}
