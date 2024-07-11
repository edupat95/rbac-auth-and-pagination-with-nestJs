import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    
    //permite obtener los ro  les de los metadatos de la clase o del metodo. 
    //Por ejemplo: @Auth(['ADMIN','USER']), nos permite obtener ['ADMIN','USER']
    const roles_required = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!roles_required) {
      return true;
    }

    //extraemos el objeto user de la solicitud. 
    const { user } = context.switchToHttp().getRequest();

    // El usuario no tiene roles, denegar el acceso
    if (!user || !user.roles || user.roles.length === 0) {
      return false; 
    }

    //Si user.roles tiene 'admin' retorna true
    if (user.roles.includes('ADMIN')) {
      return true;
    }

    //Si user.roles coicide con alguno de los roles. retorna true
    return roles_required.some((role: string) => user.roles.includes(role));
  }
}
