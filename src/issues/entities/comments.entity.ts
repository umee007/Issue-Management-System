import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import { Issue } from "./issue.entity";
import { User } from "src/users/users.entity";
@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  CommentId: number;

  @Column()
  CommentText: string;

  @Column()
  postedBy: number;

  @Column()
  IssueId: number;

  @Column({ type: "bool", default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, {eager:true})
  @JoinColumn({ name: "postedBy" })
  user: User;

  @ManyToOne(() => Issue, {eager:true})
  @JoinColumn({ name: "IssueId" })
  issue: Issue;
}
