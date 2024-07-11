import { AbstractEntity } from "../../common/entities/abstract-entitie.entity";
import { Role } from "../../roles/entities/role.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

@Entity("permission")
export class Permission extends AbstractEntity {
  @Column({ length: 100, unique: true, nullable: false })
  name: string;

  // un permiso puede tener muchos roles
  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
}
