import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { PermissionsGuard } from '../guard/permissions.guard';

export const PERMISSIONS_KEY = 'permission';

export const Permission = (permission: string) => SetMetadata(PERMISSIONS_KEY, permission);

export function Permissions(permission: string) {
  return applyDecorators(
      Permission(permission),
      //UseGuards(AuthGuard, RolesGuard),
      UseGuards(PermissionsGuard), // En el caso particular de esta app no es necesario incluir AuthGuard ya que se incluye globalmente en la app.
  );
}