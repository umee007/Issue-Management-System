
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import { Issue } from "./issue.entity";

@Entity()
export class IssueStatusLog {
  @PrimaryGeneratedColumn()
  StatusLogId: number;

  @Column()
  status: string;

  @Column({ default: new Date()})
  date: Date;

  @Column()
  IssueId: number;

  @ManyToOne(() => Issue)
  @JoinColumn({ name: "IssueId" })
  issue: Issue;

}
