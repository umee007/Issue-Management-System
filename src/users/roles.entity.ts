import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({ name: "user_role" })
@Unique(["role"])
export class UserRole {
  @PrimaryGeneratedColumn()
  roleID: number;

  @Column({ type: "varchar", nullable: false })
  role: string;

  @Column({ type: "bool", default: false })
  isDeleted: boolean;
}
