import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  Unique,
} from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Unique('UQ_ROLE_NAME', ['name'])
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  constructor(props: Partial<Role>) {
    Object.assign(this, props);
  }
}
