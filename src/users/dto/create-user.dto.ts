import { Unique } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer'; 
import { Role } from '../../roles/entities/role.entity';

export class CreateUserDto {
    
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @IsNotEmpty()
    username: string;

    @IsString()
    @MinLength(8)
    @Transform(({ value }) => value.trim()) // Quita los espacios en blanco
    @MaxLength(20)
    @IsNotEmpty() // Valida que no sea vacio
    //@IsStrongPassword()
    password: string;
    
    @IsEmail()
    @IsNotEmpty()
    email: string;

}
