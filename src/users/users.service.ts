import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { ILike, Repository } from "typeorm";
import { UserDTO, UserRoleDTO } from "./users.type";
import { UserRole } from "./roles.entity";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { JwtService } from "@nestjs/jwt";
import { JwtDTO } from "src/auth/auth.types";
import { MailerService } from "@nestjs-modules/mailer";
import { plainToClass } from "class-transformer";

dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly jwt: JwtService,
    private readonly mailerService: MailerService,
  ) { }

  async createUser(data: Partial<UserDTO>): Promise<boolean> {
    try {
      if (this.usersRepository.findOne({ where: { username: data.username } })) throw new BadRequestException("User already exist");
      const OTP = this.sendMail(data.username);

      const user = await this.findRoleByName("user");
      const hash = await bcrypt.hash(
        data.password,
        parseInt(process.env.salt_value),
      );
      const userdata = {
        username: data.username,
        password: hash,
        roleID: user.roleID,
        OTP: OTP,
      };
      await this.usersRepository.save(plainToClass(User,userdata));
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async registerOrLoginUserByGoogle(username: string): Promise<object> {
    try {
      const userExists = await this.usersRepository.findOne({ where: { username: username, isDeleted: false } });
      if (userExists) {
        try {
          const accessToken = await this.generateAccessToken(userExists);
          const refreshToken = await this.generateRefreshToken(userExists);
          return {
            accessToken,
            refreshToken,
          };
        } catch (err) {
          throw new BadRequestException("Error Logining in user");
        }

      }
      const userRole = await this.findRoleByName("user");
      const userdata = {
        username: username,
        password: null,
        roleID: userRole.roleID,
        isVerified: true,
      };
      const user = await this.usersRepository.save(this.usersRepository.create(userdata));
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);
      return {
        accessToken,
        refreshToken,
      };

    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({ where: { userID: id, isDeleted: false } });
      if (!user) throw new BadRequestException("User not found");
      if (user.role.role.toLowerCase() !== 'user') {
        throw new BadRequestException("Invalid user role. Only users can be deleted.");
      }
      await this.usersRepository.update(user, { isDeleted: true });
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  async deleteAdmin(id: number): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({ where: { userID: id, isDeleted: false } });
      if (!user) throw new BadRequestException("User not found");
      if (user.role.role.toLowerCase() !== 'admin') {
        throw new BadRequestException("Invalid user role. Only Admins can be deleted.");
      }
      await this.usersRepository.update(user, { isDeleted: true });
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async createRole(roledata: Partial<UserRoleDTO>): Promise<boolean> {
    try {
      const role: string = roledata.role;
      const roleExist = await this.userRoleRepository.findOne({ where: { role } });
      if (roleExist) throw new BadRequestException("Role already exist");
      await this.userRoleRepository.save(
        this.userRoleRepository.create(roledata),
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  async viewRole(): Promise<UserRole[]> {
    try {
      return await this.userRoleRepository.find({ where: { isDeleted: false } });
    } catch (err) {
      throw new BadRequestException("Unable to fetch Roles");
    }
  }

  async deleteRole(roleID: number): Promise<boolean> {
    try {
      const role = await this.userRoleRepository.findOne({ where: { roleID, isDeleted: false } });
      if (!role) throw new BadRequestException("Role not found");
      await this.userRoleRepository.update(role, { isDeleted: true });
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findRoleByName(role: string): Promise<UserRole> {
    try {
      return await this.userRoleRepository.findOne({ where: { role: ILike(role), isDeleted: false } });
    } catch (err) {
      throw new BadRequestException("Role not found", err.message);
    }
  }

  async login(username: string, password: string): Promise<object> {
    try {
      const user = await this.usersRepository.findOne({ where: { username, isDeleted: false } });
      if (!user) {
        throw new BadRequestException("User not found");
      }
      if(!user.password){
        throw new BadRequestException("Invalid Credentials");
      }
      const matchPass = await bcrypt.compare(password, user.password);
      if (!matchPass) {
        throw new BadRequestException("Invalid Credentials");
      }

      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);
      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  async generateAccessToken(user: User): Promise<string> {
    const payload = { userID: user.userID, role: user.roleID };
    return await this.jwt.signAsync(payload, { expiresIn: "6h" });
  }
  async generateRefreshToken(user: User): Promise<string> {
    const payload = { userID: user.userID };
    return await this.jwt.signAsync(payload, { expiresIn: "24h" });
  }

  async refreshToken(payload: JwtDTO) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userID: payload.userID },
      });
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);
      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }



  async getProfile(id: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userID: id, isDeleted: false }
      });
      if (!user) throw new BadRequestException("User not found");
      return { username: user.username, role: user.role.role, isVerified: user.isVerified};
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async fetchRole(id: number): Promise<string> {
    try {
      const role = await this.userRoleRepository.findOne({
        where: { roleID: id, isDeleted: false },
      });
      return role.role;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }


  async getAllUsers() {
    try {
      const roleIdForUser = await this.userRoleRepository.findOne({
        where: [
          { role: ILike("user"), isDeleted: false }
        ]
      });
      const users = await this.usersRepository.find({ where: { roleID: roleIdForUser.roleID, isDeleted: false } });
      return users;
    } catch (error) {
      throw new Error("Failed to get users");
    }
  }

  async getAllAdmins() {
    try {
      const roleIdForAdmin = await this.userRoleRepository.findOne({
        where: [
          { role: ILike("admin"), isDeleted: false }
        ]
      });
      const admins = await this.usersRepository.find({ where: { role: roleIdForAdmin, isDeleted: false } });
      return admins;
    } catch (error) {
      throw new Error("Failed to get users");
    }
  }


  async getAllSuperAdmins() {
    try {
      const roleIdForSUPERADMIN = await this.userRoleRepository.findOne({
        where: [
          { role: ILike("super admin"), isDeleted: false }
        ]
      });
      const S_admins = await this.usersRepository.find({ where: { role: roleIdForSUPERADMIN, isDeleted: false } });
      return S_admins;
    } catch (error) {
      throw new Error("Failed to get users");
    }
  }

  async createAdmin(data: Partial<UserDTO>): Promise<User> {
    try {
      const user = await this.findRoleByName("admin");
      const hash = await bcrypt.hash(
        data.password,
        parseInt(process.env.salt_value),
      );
      const userdata = {
        username: data.username,
        password: hash,
        roleID: user.roleID,
      };
      return await this.usersRepository.save(this.usersRepository.create(userdata));
    }
    catch (err) {
      throw new BadRequestException(err.message);
    }
  }


  async sendMail(email: string): Promise<number> {
    try {
      const random = Math.floor(1000000 + Math.random() * 9000000);
      const html = `<h2><strong> Your OTP is ${random} </strong></h2>`;
      this.mailerService.sendMail({
        to: String(email),
        from: process.env.email_user,
        subject: 'Verify your identity @ IMS',
        text: 'welcome to our platform',
        html: html,
      })
      return (random);
    }
    catch (err) {
      throw new BadRequestException("Unable to send mail");
    }

  }


  async verifyAccount(userID: number, OTP: number): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({ where: { userID, isDeleted: false, isVerified: false } });
      if(user.OTP == null) throw new BadRequestException("Regenerate your OTP");
      if(user.OTP !== OTP) throw new BadRequestException("Invalid OTP");
      await this.usersRepository.update(user, { isVerified: true });
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }


  async generateOTP (userId: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { userID:userId, isDeleted: false, } });
      if(!user) throw new BadRequestException("User not found");
      const OTP = await this.sendMail(user.username); 
      await this.usersRepository.update({userID: userId}, { OTP: OTP });
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
