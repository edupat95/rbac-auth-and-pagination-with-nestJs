import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,

    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const permission_required = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permission_required) {
      return true;
    }

    const permissionObj = await this.permissionRepository.findOne({ 
      where: { 
        name: permission_required},
        relations: ['roles'], 
    });

    if (!permissionObj) {
      console.error('Permission not found');
      throw new HttpException('Permission not found', 500);
    }
    
    const roles_required = permissionObj.roles.map(role => role.name);

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }

    if (user.roles.includes('ADMIN')) {
      return true;
    }

    return roles_required.some((role: string) => user.roles.includes(role));
  }
}
