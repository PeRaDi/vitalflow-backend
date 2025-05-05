import { ApiProperty } from '@nestjs/swagger';
import { CriticalityLevel } from 'src/utils/types';
export class CreateItemDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    criticality: CriticalityLevel;
}
