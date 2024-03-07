import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { PriorityLevel } from "./enums/priority.enum";
import { IssueStatus } from "./enums/status.enum";

export class CategoryDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  CategoryName: string;
}

export class IssueDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string;

  @IsNotEmpty()
  @ApiProperty()
  priorityLevel: PriorityLevel;

  @IsNotEmpty()
  @ApiProperty()
  category: string;
}


export class IssueIDDTO {
  @IsNotEmpty()
  @ApiProperty()
  Id: number;
}


export class CommentDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  comment: string;
}

export class UpdateStatusDTO {
  @IsNotEmpty()
  @ApiProperty()
  status: IssueStatus;
}
