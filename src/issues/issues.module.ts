import { Module } from "@nestjs/common";
import { IssuesService } from "./issues.service";
import { IssuesController } from "./issues.controller";
import { UsersModule } from "src/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Comments } from "./entities/comments.entity";
import { Issue } from "./entities/issue.entity";
import { IssueStatusLog } from "./entities/issueStatues_Log.entity";

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Category]),
    TypeOrmModule.forFeature([Comments]),
    TypeOrmModule.forFeature([Issue]),
    TypeOrmModule.forFeature([IssueStatusLog]),
  ],
  providers: [IssuesService],
  controllers: [IssuesController],
})
export class IssuesModule {}
