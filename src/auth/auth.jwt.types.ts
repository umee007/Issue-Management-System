import { IsNumber } from "class-validator";

export class JwtDTO {
  @IsNumber()
  userID: number;

  @IsNumber()
  roleID: number;
}
