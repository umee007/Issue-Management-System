import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IssuesModule } from "./issues/issues.module";
import * as dotenv from "dotenv";

dotenv.config();

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: "postgres" as const,
      host: process.env.host,
      port: parseInt(process.env.port),
      username: process.env.db_name,
      password: process.env.password,
      database: "project1",
      entities: ["dist/**/**/*.entity{.ts,.js}"],
      synchronize: true,
      autoLoadEntities: true,
    }),
    IssuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
