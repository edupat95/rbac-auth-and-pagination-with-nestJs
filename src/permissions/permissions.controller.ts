import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AuthRole } from 'src/auth/decorators/auth.decorator';
import { Permissions } from 'src/auth/decorators/permission.decorator';
import { PermissionFindDto } from './dto/permission-find.dto';
import { PageDto } from 'src/common/dto/page.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('CAN-CREATE-PERMISSIONS')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    //console.log('createPermissionDto:', createPermissionDto)
    return this.permissionsService.create(createPermissionDto);
  }

  @Get(':name')
  async getRolesByNameOfPermission(@Param('name') name: string): Promise<string[]> {
    return this.permissionsService.getRolesByNamePermission(name);  
  }

  @Get()
  @Permissions('CAN-LIST-PERMISSIONS')
  //async findAll(@Query() userFindDto: UserFindDto): Promise<PageDto<CreateUserDto>> {
  async findAll(@Query() permissionFindDto: PermissionFindDto): Promise<PageDto<CreatePermissionDto>> {
    return this.permissionsService.findAll(permissionFindDto);
  }

  //@Get(':id')
  //@AuthRole(['ADMIN', 'GENERAL-MANAGER'])
  //findOne(@Param('id') id: string) {
  //  return this.permissionsService.findOne(+id);
  //}

  @Patch(':id')
  @Permissions('CAN-UPDATE-PERMISSIONS')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    console.log('updatePermissionDto:', updatePermissionDto);
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('CAN-DELETE-PERMISSIONS')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
