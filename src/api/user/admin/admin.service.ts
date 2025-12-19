import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { appConfig } from 'src/config';
import { Roles } from 'src/common/enum/roles.enum';
import { AdminEntity } from './entities/admin.entity';
import { successRes } from 'src/infrastructure/response/success.response';
import { IToken } from 'src/infrastructure/token/interface';
import { IResponse } from 'src/infrastructure/pagination/successResponse';
import { Not, Repository } from 'typeorm';
import { SigninDto } from 'src/common/dto/signin.dto';
import { UpdatePasswordDto } from 'src/common/dto/update-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenService } from 'src/infrastructure/token/Token';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { type Response } from 'express';
@Injectable()
export class AdminService
  extends BaseService<CreateAdminDto, UpdateAdminDto, AdminEntity>
  implements OnModuleInit {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
    private readonly tokenService: TokenService,
    private readonly crypto: CryptoService,
  ) {
    super(adminRepo);
  }

  async onModuleInit() {
    const superAdmin = await this.adminRepo.findOne({
      where: { role: Roles.SUPER_ADMIN },
    });
    if (!superAdmin) {
      const password = await this.crypto.encrypt(
        appConfig.SUPER_ADMIN.PASSWORD,
      );
      const data = this.adminRepo.create({
        username: appConfig.SUPER_ADMIN.USERNAME,
        password,
        fullName: appConfig.SUPER_ADMIN.FULLNAME,
        role: Roles.SUPER_ADMIN,
      });
      await this.adminRepo.save(data);
      console.log('Super Admin created');
    }
  }
  // --------------------- CREATE ADMIN ---------------------

  async createAdmin(dto: CreateAdminDto) {
    const existsUsername = await this.adminRepo.findOneBy({
      username: dto.username,
    });

    if (existsUsername) throw new HttpException('Username already exists', 409);

    dto.password = await this.crypto.encrypt(dto.password);

    const adminData = this.adminRepo.create(dto);
    const data = await this.adminRepo.save(adminData);

    return successRes(data, 201);
  }
  // --------------------- UPDATE ---------------------

  async updateAdmin(id: number, dto: UpdateAdminDto, user: IToken): Promise<IResponse> {

    const { fullName, username, password } = dto

    const admin = await this.adminRepo.findOne({ where: { id } });

    let newPassword = admin?.password
    if (!admin) throw new HttpException('Admin not found', 404);

    if (dto.username) {
      const existsUsername = await this.adminRepo.findOne({
        where: { username: dto.username, id: Not(id) },
      });

      if (existsUsername)
        throw new HttpException('Username already exists', 409);
    }
    if (password && user.role == Roles.SUPER_ADMIN) {
      newPassword = await this.crypto.encrypt(password);
    }

    await this.adminRepo.update({ id }, { fullName, username, password: newPassword });
    const updated = await this.adminRepo.findOne({ where: { id } });

    return successRes(updated);
  }
  // --------------------- SIGN IN ADMIN ---------------------

  async signIn(dto: SigninDto, res: Response) {

    const { username, password } = dto;
    const admin = await this.adminRepo.findOne({ where: { username } });

    const isMatchPassword = await this.crypto.decrypt(
      password,
      admin?.password || '',
    );

    if (!admin || !isMatchPassword)
      throw new HttpException('Username or password is incorrect', 400);

    const payload: IToken = {
      id: admin.id,
      isActive: admin.isActive,
      role: admin.role,
    };
    const accessToken = await this.tokenService.accessToken(payload);

    // const refreshToken = await this.tokenService.refreshToken(payload);
    // await this.tokenService.writeCookie(res, 'adminToken', refreshToken, 30);

    return successRes({
      token: accessToken,
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  }
  // --------------------- SIGN OUT ---------------------

  async signOut(res: Response, tokenKey: string) {
    res.clearCookie(tokenKey);
    return successRes({});
  }

  // --------------------- UPDATE PASSWORD ADMIN ---------------------

  async updatePassword(id: number, dto: UpdatePasswordDto): Promise<IResponse> {

    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new HttpException('Admin not found', 404);

    const isMatchPassword = await this.crypto.decrypt(
      dto.oldPassword,
      admin.password,
    );
    if (!isMatchPassword)
      throw new HttpException('Old password is incorrect', 400);

    const newPassword = await this.crypto.encrypt(dto.newPassword);
    const updated = await this.adminRepo.update(id, { password: newPassword });

    return successRes(updated);
  }
}