import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Exclude()
  createdAt: Date;

  @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  @Exclude()
  updatedAt: Date;

  @Column({ type: "boolean", default: true })
  isActive: boolean;
}
