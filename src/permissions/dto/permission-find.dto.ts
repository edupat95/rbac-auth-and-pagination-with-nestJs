import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PageOptionsDto } from '../../common/dto/page-options.dto';

export class PermissionFindDto extends PageOptionsDto {

  @ApiPropertyOptional({ default: ''})  
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly name?: string;

}