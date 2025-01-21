import { ApiProperty } from '@nestjs/swagger';

export class UpdateContactDto {
    @ApiProperty()
    contact: number;

    @ApiProperty()
    info: string;
}
