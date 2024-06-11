import { Unique } from 'typeorm';
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength, IsArray, IsNotEmpty, ArrayMinSize, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer'; 
import { Role } from 'src/roles/entities/role.entity';
import { RoleDto } from './role-dto.dto';

export class CreatePermissionDto {
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

