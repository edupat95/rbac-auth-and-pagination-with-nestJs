import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { In, Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { PermissionFindDto } from './dto/permission-find.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageMetaDto } from '../common/dto/page-meta.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

  async create(createPermissionDto: CreatePermissionDto) {

    //console.log('createPermissionDto:', createPermissionDto);
    
    const { name, roles} = createPermissionDto;
    
    //console.log('roles:', roles.map(role => role.id));

    for (const role of roles) {
      const roleExist = await this.roleRepository.findOne({ where: { id: role.id } });
      if (!roleExist) {
        throw new HttpException(`The role '${role.name}' not found.`, 500);
      }
      if (roleExist.name !== role.name || roleExist.id !== role.id) {
        throw new HttpException(`Error, object role '${role.name}' is not correct.`, 500);
      }

    }

    const existPermission = await this.permissionRepository.findOne({ where: { name } });

    if (existPermission) {
      throw new HttpException(`Permission "${existPermission.name}" already exists.`, 500);
    }

    const roleIds = roles.map(role => role.id);
    const rolesObj = await this.roleRepository.findBy({ id: In(roleIds) });
    
    try {
      const permission = new Permission();
      permission.name = name;
      permission.roles = rolesObj;

      const newPermission = await this.permissionRepository.save(permission);

      return newPermission;

    } catch (error) {
      console.error('Error creating permission:', error);

      return new HttpException(`Error creating permission '${name}'. Description: ${error}`, 500);
    }
  }

  async findAll(permissionFindDto: PermissionFindDto): Promise<PageDto<CreatePermissionDto>> {
    
    const queryBuilder = this.permissionRepository.createQueryBuilder("permission");
    
    if (permissionFindDto.name != undefined) {
      queryBuilder.andWhere('permission.name LIKE :name', { name: `%${permissionFindDto.name}%` });
    }

    queryBuilder
      .leftJoinAndSelect("permission.roles", "role") // Carga completa de roles
      .orderBy("permission.createdAt", permissionFindDto.order)
      .skip(permissionFindDto.skip)
      .take(permissionFindDto.take);

    const itemCount = await queryBuilder.getCount();
    
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageOptionsDto = new PageOptionsDto(permissionFindDto);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const { name, roles } = updatePermissionDto;

    for (const role of roles) {
      const roleExist = await this.roleRepository.findOne({ where: { id: role.id } });
      if (!roleExist) {
        throw new HttpException(`The role '${role.name}' not found.`, 500);
      }
      if (roleExist.name !== role.name || roleExist.id !== role.id) {
        throw new HttpException(`Error, object role '${role.name}' is not correct.`, 500);
      }

    }

    const existPermission = await this.permissionRepository.findOne({ where: { id } });

    if (!existPermission) {
      throw new HttpException(`Permission with id '${id}' not found.`, 500);
    }

    const roleIds = roles.map(role => role.id);
    const rolesObj = await this.roleRepository.findBy({ id: In(roleIds) });
    
    try {
      existPermission.name = name;
      existPermission.roles = rolesObj;

      const permissionUpdated = await this.permissionRepository.save(existPermission);

      return permissionUpdated;

    } catch (error) {
      console.error('Error updating permission:', error);

      return new HttpException(`Error updating permission '${name}'. Description: ${error}`, 500);
    }
  }

  async remove(id: number) {
    const existPermission = await this.permissionRepository.findOne({ where: { id } });

    if (!existPermission) {
      throw new HttpException(`Permission with id '${id}' not found.`, 500);
    }

    try {
      await this.permissionRepository.delete(id);

      return HttpStatus.OK;

    } catch (error) {
      console.error('Error deleting permission:', error);

      return new HttpException(`Error deleting permission with id '${id}'. Description: ${error}`, 500);
    }
  }

  async getRolesByNamePermission(name: string): Promise<string[]> {
    const permission = await this.permissionRepository.findOne(
      { 
        where: { name },
        relations: ['roles']
      }
    );

    if (!permission) {
      throw new HttpException(`Permission with name '${name}' not found.`, 500);
    }

    const roles: string[] = permission.roles.map(role => role.name);

    return roles;
  }

  async createDefaultPermissions() {
    const permissions = [
      { name: 'CAN-CREATE-PERMISSIONS' },
      { name: 'CAN-LIST-PERMISSIONS' },
      { name: 'CAN-UPDATE-PERMISSIONS'},
      { name: 'CAN-DELETE-PERMISSIONS'},
    ];

    for (const permission of permissions) {
      const existPermission = await this.permissionRepository.findOne({ where: { name: permission.name } });
      const existRole = await this.roleRepository.findOne({ where: { name: 'ADMIN' } });

      if (!existPermission && existRole) {
        const newPermission = new Permission();
        newPermission.name = permission.name;
        newPermission.roles = [existRole];
        await this.permissionRepository.save(newPermission);
      } else {
        console.error('Error creating permission:', permission.name, 'or role ADMIN not found.');
      }
    }
    console.log('Default permissions', permissions ,' created successfully.');
    return true;
  }
}
