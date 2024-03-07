import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { IssuesService } from "./issues.service";
import { CategoryDTO, CommentDTO, IssueDTO, IssueIDDTO, UpdateStatusDTO } from "./issues.type";
import { AuthenticateAccessGuard } from "src/auth/guards/authenticateAccess.guard";
import { AuthorizeGuard } from "src/auth/guards/authorize.guard";
import { UseBy } from "src/auth/decorator/UseBy.decorator";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("issues")
export class IssuesController {
  constructor(private readonly issueService: IssuesService) {}


  @Post("addCategory")
  @UseBy("admin", "super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  addCategory(@Body() category: CategoryDTO) {
    return this.issueService.addCategory(category);
  }

  @Get("getCategories")
  @UseGuards(AuthenticateAccessGuard)
  @ApiBearerAuth()
  getCategories() {
    return this.issueService.getCategories();
  }

  @Delete("deleteCategory/:categoryId")
  @UseBy("admin", "super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  deleteCategory(@Param() categoryId: IssueIDDTO) {
    return this.issueService.deleteCategory(categoryId.Id);
  }

  @Post("addIssues")
  @UseBy("admin", "super admin", "user")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  addIssue(@Body() issue: IssueDTO, @Req() req: any) {
    return this.issueService.addIssue(issue, req["payload"].userID);
  }



  @Post("addComment/:issueId")
  @UseGuards(AuthenticateAccessGuard)
  @ApiBearerAuth()
  addComment(@Body() comment: CommentDTO, @Param() issueId: IssueIDDTO, @Req() req: any) {
    return this.issueService.addComment(comment.comment, issueId.Id, req["payload"].userID);
  }


  @Get("getComments/:issueId")
  @UseGuards(AuthenticateAccessGuard)
  @ApiBearerAuth()
  getComments(@Param() issueId: IssueIDDTO) {
    return this.issueService.getCommentsByIssueId(issueId.Id);
  }


  @Patch('updateIssueStatus/:issueId')
  @UseBy("admin", "super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  updateIssueStatus(@Param() issueId: IssueIDDTO, @Body() status: UpdateStatusDTO) {
    return this.issueService.updateIssueStatus(issueId.Id,status.status);
  }

  @Get('log/:issueId')
  @UseGuards(AuthenticateAccessGuard)
  @ApiBearerAuth()
  getLogs(@Param() issueId: IssueIDDTO) {
    return this.issueService.getIssueStatusLog(issueId.Id);
  }
  
}
