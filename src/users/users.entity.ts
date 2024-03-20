import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { UserRole } from "./roles.entity";

@Entity({ name: "user" })
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  userID: number;
  @Column({ type: "varchar", nullable: false })
  username: string;

  @Column({ type: "varchar", nullable: true })
  password: string;

  @Column()
  roleID: number;

  @Column({ type: "bool", default: false })
  isDeleted: boolean;

  @Column ({default: false, type: "bool"})
  isVerified: boolean;

  @Column({nullable: true, default: null })
  OTP: number;

  @ManyToOne(() => UserRole, { eager: true })
  @JoinColumn({ name: "roleID" })
  role: UserRole;
}
