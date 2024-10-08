import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SingInDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
