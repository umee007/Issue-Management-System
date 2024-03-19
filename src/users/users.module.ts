import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { UserRole } from "./roles.entity";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from "dotenv";
import { MailerModule } from "@nestjs-modules/mailer";

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    JwtModule.register({
      global: true,
      secret:
        "@jwt-secret!!!@secret$81y24nc938h2wN10243M%%%123##MKDFC12409I@secret",
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.email_user,
          pass: process.env.email_password,
        },
        tls: {
          rejectUnauthorized: false
      }
      }
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
