import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { loginDTO } from "./auth.types";
import { AuthService } from "./auth.service";
import { AuthenticateRefreshGuard } from "./guards/authenticateRefresh.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard";

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

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Req() req) {
    return this.authServices.googleLogin(req);
  }
}
