import { User } from './users/entities/user.entity';
import { RolesService } from './roles/roles.service';
import { UsersService } from './users/users.service';
import { PermissionsService } from './permissions/permissions.service';

export const initConfig = async (app) => {

  // Obtén una instancia del servicio RoleService
  const roleService = app.get(RolesService);
  // Ejecuta la función createDefaultRoles (admin and user)
  await roleService.createDefaultRoles();
  

  const roleAdmin = await roleService.findByName('ADMIN');
  if(!roleAdmin){
    console.error('Rol ADMIN dont exist. You must create it before continue.');
  }
  // crear usuario admin admin por defecto
  const userService = app.get(UsersService);
  const userAdmin = await userService.findOneByUsername('ADMIN');

  if(!userAdmin){
    const adminUser = new User();
    adminUser.username = 'admin';
    adminUser.password = 'admin';
    adminUser.email = 'admin@example.com';
    adminUser.roles = [roleAdmin];
    await userService.create_default_admin(adminUser);
    console.log('User admin created successfully.');
  } else {
    console.log('User admin already exists.');
  }

  const permissionsService = app.get(PermissionsService);
  await permissionsService.createDefaultPermissions();

  return true;
}
