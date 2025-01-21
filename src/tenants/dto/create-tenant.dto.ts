import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    address: string;
}
