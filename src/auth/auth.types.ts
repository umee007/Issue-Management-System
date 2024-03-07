import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, isNotEmpty } from "class-validator";

export class loginDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class JwtDTO {
  @IsNumber()
  userID: number;

  @IsNumber()
  role: number;
}
