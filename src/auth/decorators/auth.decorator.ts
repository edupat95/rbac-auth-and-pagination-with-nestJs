import { UseGuards, applyDecorators } from "@nestjs/common";
import { Roles } from "./roles.decorator";
//import { AuthGuard } from "../guard/auth.guard";
import { RolesGuard } from "../guard/roles.guard";

export function AuthRole(rolesName: string[]) {
    return applyDecorators(
        Roles(rolesName),
        //UseGuards(AuthGuard, RolesGuard),
        UseGuards(RolesGuard), // En el caso particular de esta app no es necesario incluir AuthGuard ya que se incluye globalmente en la app.
    );
}