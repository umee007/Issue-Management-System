import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CategoryDTO, CommentDTO, IssueDTO } from "./issues.type";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { Issue } from "./entities/issue.entity";
import { IssueStatus } from "./enums/status.enum";
import { PriorityLevel } from "./enums/priority.enum";
import { plainToClass } from "class-transformer";
import { Comments } from "./entities/comments.entity";
import { IssueStatusLog } from "./entities/issueStatues_Log.entity";

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>,
    @InjectRepository(IssueStatusLog)
    private readonly logRepository: Repository<IssueStatusLog>,
  ) { }

  getHello(): string {
    return "Hello World!";
  }

  async addCategory(category: CategoryDTO) {
    try {
      const categoryExist = await this.categoryRepository.findOne({
        where: { CategoryName: category.CategoryName, isDeleted: false },
      });
      if (categoryExist) throw new Error("Category already exist");
      const newCategory = this.categoryRepository.create(category);
      await this.categoryRepository.save(newCategory);
      return newCategory;
    } catch (error) {
      throw new Error("Failed to add category");
    }
  }

  async getCategories() {
    try {
      const categories = await this.categoryRepository.find({where: {isDeleted: false}});
      return categories;
    } catch (error) {
      throw new Error("Failed to get categories");
    }
  }

  async deleteCategory(categoryId: number) {
    try {
      const category = await this.categoryRepository.findOne({ where: { CategoryId: categoryId, isDeleted: false } });
      if (!category) throw new Error("Category does not exist");
      await this.categoryRepository.update(category, { isDeleted: true });
      return true;
    } catch (error) {
      throw new Error("Failed to delete category");
    }
  }

  async addIssue(issue: IssueDTO, userId: number) {

    const category = (
      await this.categoryRepository.findOne({
        where: { CategoryName: issue.category, isDeleted: false },
      })
    );
    if (!category) throw new NotFoundException("Category does not exist");
    else {
      var categoryId = category.CategoryId;
    }
    try {
      const { category, priorityLevel, ...rest } = issue;
      let priority: PriorityLevel;
      if (priorityLevel.toLowerCase() === "low") {
        priority = PriorityLevel.LOW;
      } else if (priorityLevel.toLowerCase() === "medium") {
        priority = PriorityLevel.MEDIUM;
      } else if (priorityLevel.toLowerCase() === "high") {
        priority = PriorityLevel.HIGH;
      } else if (priorityLevel.toLowerCase() === "critical") {
        priority = PriorityLevel.Critical;
      } else {
        throw new BadRequestException("Invalid priority level");
      }
      const newIssue = {
        Description: rest.description,
        Priority: priority,
        Status: IssueStatus.OPEN,
        CreatedBy: userId,
        ReportedDate: new Date(Date.now()),
        CategoryId: categoryId,
      };
      console.log(newIssue);
      //const createdIssue = this.issueRepository.create(newIssue);
      const createdIssue = plainToClass(Issue, newIssue);
      const savedIssue = await this.issueRepository.save(createdIssue);
      const log = {
        status: savedIssue.Status,
        date: savedIssue.ReportedDate,
        IssueId: savedIssue.IssueId,
      };
      const createdLog = plainToClass(IssueStatusLog, log);
      await this.logRepository.save(createdLog);
      return createdIssue;
    } catch (error) {
      throw new Error("Failed to add Issue" + error + "   " + error.message);
    }
  }



  async getAllIssues() {
    try {
      return await this.issueRepository.find({where: {isDeleted: false}});
    }
    catch (error) {
      throw new Error("Failed to get issues");
    }
  }






  async addComment(comment: string, issueId: number, userId: number) {
    const issue = await this.issueRepository.findOne({ where: { IssueId: issueId, isDeleted:false } });
    if (!issue) throw new NotFoundException("Issue does not exist");
    try {
      const newComment = {
        CommentText: comment,
        postedBy: userId,
        IssueId: issueId,
      };
      const createdComment = this.commentRepository.create(newComment);
      await this.commentRepository.save(createdComment);
      return createdComment;
    } catch (error) {
      throw new Error("Failed to add comment");
    }
  }


  async getCommentsByIssueId(issueId: number) {
    try {
      const comments = await this.commentRepository.find({ where: { IssueId: issueId, isDeleted:false }, relations: ["user"] });
      return comments;
    } catch (error) {
      throw new Error("Failed to get comments");
    }
  }

  async updateIssueStatus(issueId: number, status: IssueStatus) {

    if (!(status in IssueStatus)) {
      throw new BadRequestException("Invalid status value");
    }
    const issue = await this.issueRepository.findOne({ where: { IssueId: issueId, isDeleted:false } });
    if (!issue) throw new NotFoundException("Issue does not exist");

    try {
      await this.issueRepository.update({ IssueId: issueId }, { Status: IssueStatus[status] });
      const log = {
        status: IssueStatus[status],
        date: new Date(Date.now()),
        IssueId: issueId,
      };
      const createdLog = plainToClass(IssueStatusLog, log);
      await this.logRepository.save(createdLog);
      return issue;
    } catch (error) {
      throw new Error("Failed to update issue status" + error.message);
    }
  }



  async getIssueStatusLog(issueId: number) {
    try {
      const logs = await this.logRepository.find({
        where: { IssueId: issueId },
        select: ["status", "date", "IssueId"]
      });
      return logs;
    } catch (error) {
      throw new Error("Failed to get issue status log");
    }
  }
}
