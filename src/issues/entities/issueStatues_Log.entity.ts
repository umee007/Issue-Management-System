import { User } from "src/users/users.entity";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import { Category } from "./category.entity";
import { Issue } from "./issue.entity";

@Entity()
export class IssueStatusLog {
  @PrimaryGeneratedColumn()
  StatusLogId: number;

  @Column()
  status: string;

  @Column({ type: "date" })
  date: Date;

  @Column()
  IssueId: number;

  @ManyToOne(() => Issue)
  @JoinColumn({ name: "IssueId" })
  issue: Issue;

}
