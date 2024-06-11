import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RoleDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
