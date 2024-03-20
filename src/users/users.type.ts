import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(20, { message: "Password cannot be longer than 20 characters" })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
  })
  password: string;
}

export class UserRoleDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role: string;
}

export class DeleteUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  userID: number;
}

export class DeleteRoleDTO {
  @ApiProperty()
  @IsNotEmpty()
  roleID: number;
}


export class VerifyUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  OTP: number;
}

