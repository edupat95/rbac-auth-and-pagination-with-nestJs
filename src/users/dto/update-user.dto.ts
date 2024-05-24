import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto{
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;
  
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Transform(({ value }) => value.trim()) // Quita los espacios en blanco
  @MaxLength(20)
  password?: string;
  
  @IsEmail()
  email: string;

  @IsString({ each: true })
  roles: string[];
}
