import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRole } from '../auth/decorators/auth.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveIterface } from '../common/interfaces/ative-user.interface';
import { PageDto } from '../common/dto/page.dto';
import { UserFindDto } from './dto/find-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    ) {}

  @Get('user/profile')
  async getProfile(@ActiveUser() user: UserActiveIterface){
    return this.usersService.getProfile(user.id);
  }

  @Post()
  @AuthRole(['ADMIN', 'GENERAL-MANAGER'])
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @AuthRole(['ADMIN', 'GENERAL-MANAGER'])
  async findAll(@Query() userFindDto: UserFindDto): Promise<PageDto<CreateUserDto>> {
    return await this.usersService.findAll(userFindDto);
  }

  @Patch(':id')
  @AuthRole(['ADMIN', 'GENERAL-MANAGER'])
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @AuthRole(['ADMIN', 'GENERAL-MANAGER'])
  async remove(@Param('id') id: string) {
    console.log('controller id', id);
    return await this.usersService.remove(+id);
  }

  @Get('enable/:id')
  @AuthRole(['ADMIN', 'GENERAL-MANAGER'])
  async enableUser(@Param('id') id: string) {
    return await this.usersService.enableUser(+id);
  }

  
}
