import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./google.strategy";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot(),
    UsersModule,
    JwtModule.register({
      global: true,
      secret:
        "@jwt-secret!!!@secret$81y24nc938h2wN10243M%%%123##MKDFC12409I@secret",
    }),
    PassportModule.register({ defaultStrategy: 'google' }),
  ],
  controllers: [AuthController],
  providers: [AuthService,GoogleStrategy],
})
export class AuthModule {}
