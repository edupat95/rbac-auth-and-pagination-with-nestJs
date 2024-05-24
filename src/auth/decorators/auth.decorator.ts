import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { Roles } from "./roles.decorator";
import { AuthGuard } from "../guard/auth.guard";
import { RolesGuard } from "../guard/roles.guard";
import { Role } from "src/roles/entities/role.entity";

export function Auth(rolesName: string[]) {
    return applyDecorators(
        Roles(rolesName),
        UseGuards(AuthGuard, RolesGuard),
    );
}