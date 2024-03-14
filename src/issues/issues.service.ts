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
import { slack_chat_api } from "src/third party APIs/slack_send_message_api";
import { UsersService } from "src/users/users.service";
import axios from "axios";

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
    private readonly userService: UsersService
  ) { }


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
      const categories = await this.categoryRepository.find({ where: { isDeleted: false } });
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
      const user_who_posted_issue = await this.userService.getProfile(savedIssue.CreatedBy);
      const message = "New Issue Created. \nDescription: " + savedIssue.Description + "\n By: " + user_who_posted_issue.username + "\nPriority: " + priority+ "\nCategrory: "+categoryId;
      await this.sendSlackMessage(message);

      return createdIssue;
    } catch (error) {
      throw new Error("Failed to add Issue" + error + "   " + error.message);
    }
  }

  async sendSlackMessage(message: string): Promise<void> {
    const webhookUrl = slack_chat_api;
    const data = {
      "text": message,
    };

    try {
      await axios.post(webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Slack message sent successfully.');
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw new Error('Failed to send Slack message');
    }
  }



  async getAllIssues() {
    try {
      return await this.issueRepository.find({ where: { isDeleted: false } });
    }
    catch (error) {
      throw new Error("Failed to get issues");
    }
  }






  async addComment(comment: string, issueId: number, userId: number) {
    const issue = await this.issueRepository.findOne({ where: { IssueId: issueId, isDeleted: false } });
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
      const comments = await this.commentRepository.createQueryBuilder("comment")
        .leftJoinAndSelect("comment.user", "user")
        .leftJoinAndSelect("user.role", "role")
        .select([
          "comment.CommentId",
          "comment.CommentText",
          "comment.Date",
          "comment.IssueId",
          "user.userID",
          "user.username",
          "role.role"
        ])
        .where("comment.IssueId = :issueId", { issueId: issueId })
        .andWhere("comment.isDeleted = false")
        .getMany();

      return comments;
    } catch (error) {
      throw new Error("Failed to get comments");
    }
  }

  async updateIssueStatus(issueId: number, status: IssueStatus) {


    function checkIssueStatus(status:string) {
      let issueStatus: IssueStatus;
      switch (status.toLowerCase()) {
        case 'open':
          issueStatus = IssueStatus.OPEN;
          break;
        case 'in_progress':
        case 'in progress':
          issueStatus = IssueStatus.IN_PROGRESS;
          break;
        case 'pending':
          issueStatus = IssueStatus.PENDING;
          break;
        case 'onhold':
        case 'on hold':
          issueStatus = IssueStatus.ONHOLD;
          break;
        case 'resolved':
          issueStatus = IssueStatus.RESOLVED;
          break;
        case 'closed':
          issueStatus = IssueStatus.CLOSED;
          break;
        default:
          throw new BadRequestException("Invalid status");
      }
      return issueStatus;
    }
    let issueStatus: IssueStatus = checkIssueStatus(status);

    const issue = await this.issueRepository.findOne({ where: { IssueId: issueId, isDeleted: false } });
    if (!issue) throw new NotFoundException("Issue does not exist");
    if (issueStatus == checkIssueStatus(issue.Status)) throw new BadRequestException("Issue is already in " + issueStatus + " status");
    try {
      await this.issueRepository.update({ IssueId: issueId, isDeleted: false }, { Status: issueStatus });
      const log = {
        status: issueStatus,
        date: new Date(),
        IssueId: issueId,
      };
      const createdLog = plainToClass(IssueStatusLog, log);
      await this.logRepository.save(createdLog);
      const updatedIssue = await this.issueRepository.findOne({ where: { IssueId: issueId, isDeleted: false } });
      return updatedIssue;
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
