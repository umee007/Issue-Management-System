import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { User } from "src/users/users.entity";
import { UserRole } from "src/users/roles.entity";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret:
        "@jwt-secret!!!@secret$81y24nc938h2wN10243M%%%123##MKDFC12409I@secret",
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
