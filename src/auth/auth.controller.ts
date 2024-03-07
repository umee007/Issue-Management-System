import {
  Body,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtDTO, loginDTO } from "./auth.types";
import { AuthService } from "./auth.service";
import { AuthenticateRefreshGuard } from "./guards/authenticateRefresh.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UseBy } from "./decorator/UseBy.decorator";
import { AuthorizeGuard } from "./guards/authorize.guard";
import { AuthenticateAccessGuard } from "./guards/authenticateAccess.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authServices: AuthService) {}
  @Post("login")
  login(@Body() loginDTO: loginDTO) {
    return this.authServices.login(loginDTO);
  }
  @Get("refreshToken")
  @UseGuards(AuthenticateRefreshGuard)
  @ApiBearerAuth()
  refreshToken(@Req() req) {
    return this.authServices.refreshToken(req.payload);
  }
}
