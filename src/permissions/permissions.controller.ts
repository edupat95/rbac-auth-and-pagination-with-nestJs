import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PermissionFindDto } from './dto/permission-find.dto';
import { PageDto } from '../common/dto/page.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveIterface } from 'src/common/interfaces/ative-user.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('CAN-CREATE-PERMISSIONS')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get('/roles-by-permission/:name')
  async getRolesByNameOfPermission(@Param('name') name: string): Promise<string[]> {
    return this.permissionsService.getRolesByNamePermission(name);
  }

  @Get('/permissions-of-user')
  async getPermissionsOfUser(@ActiveUser() user: UserActiveIterface) {
    return this.permissionsService.getPermissionsByUser(user);
  }

  @Get()
  @Permissions('USER-ADMINISTRATION-CAN-LIST-PERMISSIONS')
  //async findAll(@Query() userFindDto: UserFindDto): Promise<PageDto<CreateUserDto>> {
  async findAll(@Query() permissionFindDto: PermissionFindDto): Promise<PageDto<CreatePermissionDto>> {
    return this.permissionsService.findAll(permissionFindDto);
  }

  @Patch(':id')
  @Permissions('USER-ADMINISTRATION-CAN-UPDATE-PERMISSIONS')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('USER-ADMINISTRATION-CAN-DELETE-PERMISSIONS')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
