import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../common/dto/page-options.dto';

export class RoleFindDto extends PageOptionsDto {

  @ApiPropertyOptional({ default: ''})  
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly name?: string;

}