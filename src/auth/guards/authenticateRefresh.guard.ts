import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common/exceptions/unauthorized.exception";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtDTO } from "../auth.types";

@Injectable()
export class AuthenticateRefreshGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) throw new UnauthorizedException();
    try {
      const payload: JwtDTO = await this.jwt.verifyAsync(token);
      if (!payload) {
        throw new UnauthorizedException("Invalid Token");
      }
      if (payload.role) {
        throw new UnauthorizedException("Invalid Refresh Token");
      }
      req["payload"] = { userID: payload.userID };
    } catch (err) {
      throw new UnauthorizedException("Invalid Token");
    }
    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
