import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,

    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    //console.log('PermissionsGuard');
    
    //permite obtener el nombre del permiso de los metadatos de la clase o del metodo. 
    const permission_required = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    //Si no hay permisos requeridos, permitir el acceso
    if (!permission_required) {
      return true;
    }

    //Buscamos los roles vinculados a permiso.
    const permissionObj = await this.permissionRepository.findOne({ 
      where: { 
        name: permission_required},
        relations: ['roles'], 
    });

    if (!permissionObj) {
      console.error('Permission not found');
      throw new HttpException('Permission not found', 500);
    }
    
    //console.log('permission_required:', permission_required);
    //console.log('permission_roles', permissionObj.roles); 

    const roles_required = permissionObj.roles.map(role => role.name);

    //extraemos el objeto user de la solicitud. 
    const { user } = context.switchToHttp().getRequest();

    // El usuario no tiene roles, denegar el acceso
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }

    //console.log('permission_roles_required:', permissionObj);
    //console.log('user.roles:', user.roles);
    //console.log('Result: ' + roles_required.some((role: string) => user.roles.includes(role)))

    //Si user.roles tiene 'admin' retorna true
    if (user.roles.includes('ADMIN')) {
      return true;
    }

    //Si user.roles coicide con alguno de los permission_roles_required retorna true
    return roles_required.some((role: string) => user.roles.includes(role));;
  }
}
