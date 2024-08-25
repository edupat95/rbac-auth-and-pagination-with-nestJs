import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthRole } from '../auth/decorators/auth.decorator';
import { PageDto } from '../common/dto/page.dto';
import { RoleFindDto } from './dto/find-role.dto';
import { Permissions } from 'src/auth/decorators/permission.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @AuthRole(['ADMIN', 'GENERAL-MANAGER'])
  create(@Body() createRoleDto: CreateRoleDto) {
    console.log('createRoleDto:', createRoleDto);
    return this.rolesService.create(createRoleDto);
  }
  
  @Get()
  @Permissions('USER-ADMINISTRATION-CAN-LIST-ROLES')
  async findAll(@Query() roleFindDto: RoleFindDto): Promise<PageDto<CreateRoleDto>> {
    return await this.rolesService.findAll(roleFindDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @AuthRole(['ADMIN','GENERAL-MANAGER'])
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':name')
  @AuthRole(['ADMIN','GENERAL-MANAGER'])
  remove(@Param('name') name: string) {
    console.log('controller->name:', name);
    return this.rolesService.remove(name);
  }

  
}
