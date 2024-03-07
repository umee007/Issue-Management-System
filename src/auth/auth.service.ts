import { Injectable } from "@nestjs/common";
import { JwtDTO, loginDTO } from "./auth.types";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  async login(dto: loginDTO) {
    return this.userService.login(dto.username, dto.password);
  }

  async refreshToken(payload: JwtDTO): Promise<Object> {
    return this.userService.refreshToken(payload);
  }
}
