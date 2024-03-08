import { User } from "src/users/users.entity";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import { Category } from "./category.entity";
import { PriorityLevel } from "../enums/priority.enum";
import { IssueStatus } from "../enums/status.enum";

@Entity()
export class Issue {
  @PrimaryGeneratedColumn()
  IssueId: number;

  @Column()
  Description: string;

  @Column({type: 'enum', enum:PriorityLevel, default: PriorityLevel.MEDIUM})
  Priority: PriorityLevel;

  @Column({type: 'enum', enum: IssueStatus, default: IssueStatus.OPEN})
  Status: IssueStatus;

  @Column({ type: "date" })
  ReportedDate: Date;

  @Column({ type: "date", nullable: true })
  ResolvedDate: Date;

  @Column({ type: "bool", default: false })
  isDeleted: boolean;

  @Column({nullable: false})
  CreatedBy: number;
  @Column({nullable: true})
  AssignedTo: number;
  @Column({nullable: false})
  CategoryId: number;

  @ManyToOne(() => User, )
  @JoinColumn({ name: "CreatedBy" })
  createdByUser: User;

  @ManyToOne(() => User, )
  @JoinColumn({ name: "AssignedTo" })
  assignedToUser: User;

  @ManyToOne(() => Category,)
  @JoinColumn({ name: "CategoryId" })
  category: Category;

}
