import { ApiProperty } from "@nestjs/swagger";

interface ContanctDto {
    contact: number;
    info: string;
}

export class AddContactsDto {
    @ApiProperty()
    contacts: ContanctDto[];
}
