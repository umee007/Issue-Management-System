import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { DeleteRoleDTO, DeleteUserDTO, UserDTO, UserRoleDTO } from "./users.type";
import { UsersService } from "./users.service";
import { UseBy } from "src/auth/decorator/UseBy.decorator";
import { AuthenticateAccessGuard } from "src/auth/guards/authenticateAccess.guard";
import { AuthorizeGuard } from "src/auth/guards/authorize.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("registerUser")
  createUser(@Body() data: UserDTO) {
    try {
      return this.usersService.createUser(data);
    } catch (error) {
      throw new UnauthorizedException("Unable to Create User");
    }
  }

  // @Get("sendMail")
  // sendMail() {
  //   return this.usersService.sendMail('juttg123456.g@gmail.com');
  // }
  @Delete("deleteUser:/userId")
  @UseBy("admin", "super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  deleteUser(@Param() userId:DeleteUserDTO){
    return this.usersService.deleteUser(userId.userID);
  }


  @Delete("UserDeleteItself")
  @UseBy("user")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  userdeleteitself(@Req() req){
    return this.usersService.deleteUser(req["payload"].userID);
  }


  @Post("registerRole")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @UseBy("admin", "super admin")
  @ApiBearerAuth()
  createRole(@Body() data: UserRoleDTO) {
    try {
      return this.usersService.createRole(data);
    } catch (error) {
      throw new UnauthorizedException("Unable to Create Role");
    }
  }

  @Delete("deleteRole/:role")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @UseBy("admin", "super admin")
  @ApiBearerAuth()
  deleteRole(@Param() data: DeleteRoleDTO) {
    try {
      return this.usersService.deleteRole(data.roleID);
    } catch (error) {
      throw new UnauthorizedException("Unable to Delete Role");
    }
  }

  @Post("registerAdmin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @UseBy("super admin")
  @ApiBearerAuth()
  createAdmin(@Body() data: UserDTO) {
    try {
      return this.usersService.createAdmin(data);
    } catch (error) {
      throw new UnauthorizedException("Unable to Create Role");
    }
  }

  @Delete("deleteAdmin/:adminId")
  @UseBy("super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  deleteAdmin(@Param() adminId:DeleteUserDTO){
    return this.usersService.deleteAdmin(adminId.userID);
  }

  @Get("getprofile")
  @UseGuards(AuthenticateAccessGuard)
  @ApiBearerAuth()
  getProfile(@Req() req) {
    const userId = req["payload"].userID;
    return this.usersService.getProfile(userId);
  }

  @Get("allRoles")
  @UseBy("admin", "super admin")
  @UseGuards(AuthenticateAccessGuard,AuthorizeGuard)
  @ApiBearerAuth()
  getRoles() {
    return this.usersService.viewRole();
  }


  @Get("allUsers")
  @UseBy("admin", "super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
  @Get("allAdmins")
  @UseBy("super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  getAllAdmins() {
    return this.usersService.getAllAdmins();
  }


  @Get("allSuperAdmins")
  @UseBy("super admin")
  @UseGuards(AuthenticateAccessGuard, AuthorizeGuard)
  @ApiBearerAuth()
  getAllSuperAdmin() {
    return this.usersService.getAllSuperAdmins();
  }


  


}
