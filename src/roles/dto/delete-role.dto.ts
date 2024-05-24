import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, min } from 'class-validator';

export class DeleteRoleDto {
    @ApiPropertyOptional({ minimum: 1})
    @IsNotEmpty()
    @IsInt()
    readonly id: number;
}
