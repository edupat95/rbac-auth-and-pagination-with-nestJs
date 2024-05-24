import { Unique } from 'typeorm';
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer'; 
import { Role } from 'src/roles/entities/role.entity';

export class CreateUserDto {
    
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;

    @IsString()
    @MinLength(8)
    @Transform(({ value }) => value.trim()) // Quita los espacios en blanco
    @MaxLength(20)
    password: string;
    
    @IsEmail()
    email: string;

}
