import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtDTO } from "../auth.types";
import { UsersService } from "src/users/users.service";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user: JwtDTO = req["payload"];
    if (!user) {
      throw new ForbiddenException(
        "You do not have permission to access this resource.",
      );
    }
    const UserRole: string = await this.userService.fetchRole(user.role);

    const desiredRole = this.reflector.get<string[]>(
      "roles",
      context.getHandler(),
    );

    if (!desiredRole) {
      return true; // No role restriction specified, allow access
    }

    const hasPermission = desiredRole.some(
      (role) => UserRole.toLowerCase() === role.toLowerCase(),
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        "You do not have permission to access this resource.",
      );
    }

    return true;
  }
}
