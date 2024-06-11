import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsNotEmpty, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleDto } from './role-dto.dto';

export class UpdatePermissionDto {
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;
  
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ArrayNotEmpty() // Asegura que no haya objetos vacíos en el array
  @ValidateNested({ each: true}) // Valida cada objeto en el array
  @Type(() => RoleDto)
  roles: RoleDto[];
}
