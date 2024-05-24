import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

export class UserFindDto extends PageOptionsDto {

  @ApiPropertyOptional({ default: ''})  
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly username?: string;

  @ApiPropertyOptional({ default: ''})  
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly email?: string;
  
  @ApiPropertyOptional({ minimum: 1, maximum: 2, default: 2})
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  readonly state?: number = 2;

}